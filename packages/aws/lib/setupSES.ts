import { Stack, Duration } from "aws-cdk-lib";
import { Architecture, Runtime } from "aws-cdk-lib/aws-lambda";
import { SqsEventSource } from "aws-cdk-lib/aws-lambda-event-sources";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { RetentionDays } from "aws-cdk-lib/aws-logs";
import {
  ConfigurationSet,
  EventDestination,
  EmailIdentity,
  Identity,
} from "aws-cdk-lib/aws-ses";
import { Topic } from "aws-cdk-lib/aws-sns";
import { SqsSubscription } from "aws-cdk-lib/aws-sns-subscriptions";
import { Queue } from "aws-cdk-lib/aws-sqs";
import * as path from "path";
import { env } from "../utils/env";

type SetupSESProps = {
  stack: Stack;
};

const sesEventsTopicName = "ses-events-topic";
const configurationSetEventDestinationName = "ses-event-destination";
const sesEventsProcessorFunctionName = "ses-events-processor";
const sesEmailIdentityName = `ses-identity`;
const configurationSetName = `ses-configuration-set`;
const sesEventsQueueName = `ses-events-queue`;

export const setupSES = ({ stack }: SetupSESProps) => {
  const sesEventsTopic = new Topic(stack, sesEventsTopicName, {
    displayName: sesEventsTopicName,
    topicName: sesEventsTopicName,
  });

  const sesEventsQueue = new Queue(stack, sesEventsQueueName, {
    queueName: sesEventsQueueName,
    retentionPeriod: Duration.days(14),
    visibilityTimeout: Duration.seconds(30),
    // Long polling
    receiveMessageWaitTime: Duration.seconds(20),
  });

  sesEventsTopic.addSubscription(new SqsSubscription(sesEventsQueue));

  /**
   * We need this config set so we can capture events like bounces, complaints, etc.
   * We separate them by subdomain so if we need to shut down one part of our email infrastructure,
   * we can do so without affecting the other parts.
   */
  const configurationSet = new ConfigurationSet(stack, configurationSetName, {
    configurationSetName,
  });

  // Send events to our topic
  configurationSet.addEventDestination(configurationSetEventDestinationName, {
    configurationSetEventDestinationName,
    destination: EventDestination.snsTopic(sesEventsTopic),
  });

  // Strips out https:// and any trailing slashes
  const rawUrl = new URL(env.NEXT_PUBLIC_BASE_URL).hostname;
  const identity = Identity.domain(rawUrl);

  /**
   * notifications.plutomi.com for production OR
   * notifications.deploymentEnvironment.plutomi.com
   */
  const mailFromDomain = `notifications.${rawUrl}`;

  // Create the SES identity
  void new EmailIdentity(stack, sesEmailIdentityName, {
    identity,
    configurationSet,
    mailFromDomain,
  });

  const eventConsumerFunction = new NodejsFunction(
    // ! TODO: Switch to rust
    stack,
    sesEventsProcessorFunctionName,
    {
      functionName: sesEventsProcessorFunctionName,
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
        QUEUE_URL: sesEventsQueue.queueUrl,
        ...env,
      },
    }
  );

  eventConsumerFunction.addEventSource(
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
};
