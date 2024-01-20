import { Duration, Stack } from "aws-cdk-lib";
import { EventBus } from "aws-cdk-lib/aws-events";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { SqsEventSource } from "aws-cdk-lib/aws-lambda-event-sources";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { RetentionDays } from "aws-cdk-lib/aws-logs";
import {
  DeduplicationScope,
  FifoThroughputLimit,
  Queue,
} from "aws-cdk-lib/aws-sqs";
import path = require("path");
import { env } from "../utils/env";

type createEventsArchitectureProps = {
  stack: Stack;
};

const queueName = "plutomi-events-queue.fifo";
const eventConsumerName = "plutomi-events-consumer";
/**
 * Creates a FIFO queue and a lambda function that consumes events sent into it.
 * This does not include SES events, which are handled in setupSES.ts due to it not supporting FIFO
 * and us not caring about that being FIFO.
 * In the future, we would like to support multiple event consumers / queues but this is more than fine for now
 * especially due to high throughput mode.
 */
export const createEventsArchitecture = ({
  stack,
}: createEventsArchitectureProps) => {
  const eventConsumerQueue = new Queue(stack, queueName, {
    queueName,
    retentionPeriod: Duration.days(14),
    visibilityTimeout: Duration.seconds(30),
    // Long polling
    receiveMessageWaitTime: Duration.seconds(20),
    // FIFO related stuff
    fifo: true,
    contentBasedDeduplication: true,
    // Required for high throughput mode
    deduplicationScope: DeduplicationScope.MESSAGE_GROUP,
    fifoThroughputLimit: FifoThroughputLimit.PER_MESSAGE_GROUP_ID,
  });

  const plutomiEventConsumerFunction = new NodejsFunction(
    stack,
    eventConsumerName,
    {
      // TODO should be in rust
      functionName: eventConsumerName,
      entry: path.join(__dirname, "../functions/plutomiEventConsumer.ts"),
      handler: "handler",
      runtime: Runtime.NODEJS_LATEST,
      reservedConcurrentExecutions: 3,
      memorySize: 128,
      timeout: Duration.seconds(30),
      logRetention: RetentionDays.ONE_WEEK,
      environment: {
        QUEUE_URL: eventConsumerQueue.queueUrl,
        ...env,
      },
    }
  );

  // Add the queue as an event source to the lambda function
  plutomiEventConsumerFunction.addEventSource(
    new SqsEventSource(eventConsumerQueue, {
      // TODO: https://docs.aws.amazon.com/lambda/latest/dg/with-sqs.html#services-sqs-batchfailurereporting
      // batchSize: 100, // FIFO max is 10, and since we're doing fifo just process them as they come in
      // maxBatchingWindow // Not supported for FIFO
      maxConcurrency: 2,
      reportBatchItemFailures: true,
    })
  );
};
