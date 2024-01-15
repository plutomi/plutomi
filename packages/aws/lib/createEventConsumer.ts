import { Duration, Stack } from "aws-cdk-lib";
import { EventBus } from "aws-cdk-lib/aws-events";
import { Architecture, Code, Runtime } from "aws-cdk-lib/aws-lambda";
import { SqsEventSource } from "aws-cdk-lib/aws-lambda-event-sources";
import { Function } from "aws-cdk-lib/aws-lambda";
import { RetentionDays } from "aws-cdk-lib/aws-logs";
import { Queue } from "aws-cdk-lib/aws-sqs";
import path = require("path");
import { env } from "../utils/env";

type CreateEventConsumerProps = {
  stack: Stack;
  eventBus: EventBus;
};

const plutomiEventConsumerQueueName = "plutomi-events-queue";
const plutomiEventConsumerFunctionName = "plutomi-events-consumer";
/**
 * Creates a queue and a lambda function that consumes events from the event bus.
 * In the future, we would like to support multiple event consumers / queues but for now this is fine.
 */
export const createEventConsumer = ({
  stack,
  eventBus,
}: CreateEventConsumerProps) => {
  const eventConsumerQueue = new Queue(stack, plutomiEventConsumerQueueName, {
    queueName: plutomiEventConsumerQueueName,
    retentionPeriod: Duration.days(14),
    visibilityTimeout: Duration.seconds(30),
    // Long polling
    receiveMessageWaitTime: Duration.seconds(20),
  });

  const plutomiEventConsumerFunction = new Function(
    stack,
    plutomiEventConsumerFunctionName,
    {
      runtime: Runtime.PROVIDED_AL2,
      handler: "main",
      functionName: plutomiEventConsumerFunctionName,
      memorySize: 128,
      logRetention: RetentionDays.ONE_WEEK,
      timeout: Duration.seconds(30),
      architecture: Architecture.ARM_64,
      // This needs to be higher than maxConcurrency in the event source
      // Temporarily disabled because  it causes an issue when trying to deploy to staging and dev environments because our account concurrency is so low :/=
      //  reservedConcurrentExecutions: 3,
      description: "Processes SES events.",
      environment: {
        EVENT_BUS_NAME: eventBus.eventBusName,
        QUEUE_URL: eventConsumerQueue.queueUrl,
        ...env,
      },
      code: Code.fromAsset(
        path.join(
          __dirname,
          "../../../packages/consumers/plutomi-events/target/lambda/plutomi-events/Bootstrap.zip"
        )
      ),
    }
  );

  //  Add the queue as an event source to the lambda function
  plutomiEventConsumerFunction.addEventSource(
    new SqsEventSource(eventConsumerQueue, {
      // TODO: https://docs.aws.amazon.com/lambda/latest/dg/with-sqs.html#services-sqs-batchfailurereporting
      // Implement batch processing AND partial failures
      // https://docs.aws.amazon.com/lambda/latest/dg/with-sqs.html event.Records
      // TODO Do we want to do this or process right away?
      batchSize: 100,
      maxBatchingWindow: Duration.minutes(1),
      maxConcurrency: 2,
      reportBatchItemFailures: true,
    })
  );

  // Allow the lambda function to put events back into the event bus if needed
  // For example, we might consume a scheduled.rule.deleted event so we should delete any pending scheduled events for that rule
  // ie: "Move applicants to the next stage if idle for 30 days" -> If that rule is deleted, we no longer want to do this so we should delete all scheduled events.
  eventBus.grantPutEventsTo(plutomiEventConsumerFunction);
};
