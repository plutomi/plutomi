import { Stack, Duration } from "aws-cdk-lib";
import { Architecture, Runtime } from "aws-cdk-lib/aws-lambda";
import { SqsEventSource } from "aws-cdk-lib/aws-lambda-event-sources";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { RetentionDays } from "aws-cdk-lib/aws-logs";
import { ConfigurationSet, EventDestination } from "aws-cdk-lib/aws-ses";
import { Topic } from "aws-cdk-lib/aws-sns";
import { SqsSubscription } from "aws-cdk-lib/aws-sns-subscriptions";
import { Queue } from "aws-cdk-lib/aws-sqs";
import * as path from "path";
import { env } from "../utils/env";
import { EventBus } from "aws-cdk-lib/aws-events";

type configureEmailsProps = {
  stack: Stack;
  eventBus: EventBus;
};

const sesEventsTopicName = "ses-events-topic";
const configurationSetEventDestinationName = "ses-event-destination";
const sesEventsConsumerName = "ses-events-consumer";
const configurationSetName = `ses-configuration-set`;
const sesEventsQueueName = `ses-events-queue`;

/**
 * Creates an SNS topic, queue, and lambda function to process SES events.
 * We need this config set so we can capture events like bounces, complaints, etc.
 * https://docs.aws.amazon.com/ses/latest/dg/monitor-using-event-publishing.html
 *
 * A couple of things on "why didn't you do X":
 * - Cannot publish events directly to EventBridge
 * - Cannot publish events directly to SQS
 * - We don't want all events, and some events might need more data before forwarding,
 *  so we need a lambda function to process the events before sending them to EventBridge to be handled
 *  by any other services that need to know about them. This allows us to standardize the event format as well.
 *
 * @returns ConfigurationSet to pass in to configureEmails
 */
export const createEmailEventsConsumer = ({
  stack,
  eventBus,
}: configureEmailsProps): ConfigurationSet => {
  // SNS Topic for all events, they have to go through here :(
  const sesEventsTopic = new Topic(stack, sesEventsTopicName, {
    displayName: sesEventsTopicName,
    topicName: sesEventsTopicName,
  });

  // Queue for our lambda function to consume
  const sesEventsQueue = new Queue(stack, sesEventsQueueName, {
    queueName: sesEventsQueueName,
    retentionPeriod: Duration.days(14),
    visibilityTimeout: Duration.seconds(30),
    // Long polling
    receiveMessageWaitTime: Duration.seconds(20),
  });

  sesEventsTopic.addSubscription(new SqsSubscription(sesEventsQueue));

  // This is required by SES
  const configurationSet = new ConfigurationSet(stack, configurationSetName, {
    configurationSetName,
  });

  // Configure SES to send events to our topic
  configurationSet.addEventDestination(configurationSetEventDestinationName, {
    configurationSetEventDestinationName,
    destination: EventDestination.snsTopic(sesEventsTopic),
  });

  // Lambda function to consume the events
  // This will also transform them into a standard format for EventBridge
  const sesEventConsumerFunction = new NodejsFunction(
    // ! TODO: Switch to rust
    stack,
    sesEventsConsumerName,
    {
      functionName: sesEventsConsumerName,
      runtime: Runtime.NODEJS_LATEST,
      entry: path.join(__dirname, "../functions/sesEventConsumer.ts"),
      logRetention: RetentionDays.ONE_WEEK,
      // This needs to be higher than maxConcurrency in the event source
      reservedConcurrentExecutions: 3,
      memorySize: 128,
      timeout: Duration.seconds(30),
      architecture: Architecture.ARM_64,
      description: "Processes SES events.",
      environment: {
        EVENT_BUS_NAME: eventBus.eventBusName,
        QUEUE_URL: sesEventsQueue.queueUrl,
        ...env,
      },
    }
  );

  // Add the queue as an event source to the lambda function
  sesEventConsumerFunction.addEventSource(
    new SqsEventSource(sesEventsQueue, {
      // TODO: https://docs.aws.amazon.com/lambda/latest/dg/with-sqs.html#services-sqs-batchfailurereporting
      // Implement batch processing AND partial failures
      // https://docs.aws.amazon.com/lambda/latest/dg/with-sqs.html event.Records
      batchSize: 100,
      maxBatchingWindow: Duration.minutes(1),
      maxConcurrency: 2,
      reportBatchItemFailures: true,
    })
  );

  // Give the lambda function permission to publish to the event bus
  eventBus.grantPutEventsTo(sesEventConsumerFunction);

  return configurationSet;
};
