import { Duration, Stack } from "aws-cdk-lib";
import { EventBus } from "aws-cdk-lib/aws-events";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { SqsEventSource } from "aws-cdk-lib/aws-lambda-event-sources";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { RetentionDays } from "aws-cdk-lib/aws-logs";
import { Queue } from "aws-cdk-lib/aws-sqs";
import path = require("path");
import { env } from "../utils/env";

type CreateEventConsumerProps = {
  stack: Stack;
  eventBus: EventBus;
};

const plutomiEventConsumerQueueName = "plutomi-event-consumer-queue";
const plutomiEventConsumerFunctionName = "plutomi-event-consumer";
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

  const plutomiEventConsumerFunction = new NodejsFunction(
    stack,
    plutomiEventConsumerFunctionName,
    {
      // TODO should be in rust
      functionName: plutomiEventConsumerFunctionName,
      entry: path.join(__dirname, "../functions/plutomiEventConsumer.ts"),
      handler: "handler",
      runtime: Runtime.NODEJS_LATEST,
      // Temporarily disabled because  it causes an issue when trying to deploy to staging and dev environments because our account concurrency is so low :/
      //  reservedConcurrentExecutions: 3,
      memorySize: 128,
      timeout: Duration.seconds(30),
      logRetention: RetentionDays.ONE_WEEK,
      environment: {
        EVENT_BUS_NAME: eventBus.eventBusName,
        QUEUE_URL: eventConsumerQueue.queueUrl,
        ...env,
      },
    }
  );

  //  Add the queue as an event source to the lambda function
  plutomiEventConsumerFunction.addEventSource(
    new SqsEventSource(eventConsumerQueue, {
      // TODO: https://docs.aws.amazon.com/lambda/latest/dg/with-sqs.html#services-sqs-batchfailurereporting
      // Implement batch processing AND partial failures
      // https://docs.aws.amazon.com/lambda/latest/dg/with-sqs.html event.Records
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
