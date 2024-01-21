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

type CreateEventsConsumerProps = {
  stack: Stack;
  eventBus: EventBus;
};

const queueName = "plutomi-events-queue";
const eventConsumerName = "plutomi-events-consumer";
/**
 * Creates a queue and a lambda function that consumes events from the event bus.
 * In the future we would like to support multiple event consumers / queues but for now this is fine.
 * The EventBridge setup that we have allows that easily.
 */
export const createEventsConsumer = ({
  stack,
  eventBus,
}: CreateEventsConsumerProps) => {
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
      // Needs to be higher than maxConcurrency in addEventSource
      reservedConcurrentExecutions: 3,
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

  // Add the queue as an event source to the lambda function
  plutomiEventConsumerFunction.addEventSource(
    new SqsEventSource(eventConsumerQueue, {
      // TODO: https://docs.aws.amazon.com/lambda/latest/dg/with-sqs.html#services-sqs-batchfailurereporting

      // Disabling for now, process events one by one as they come in
      // batchSize: 100,
      // maxBatchingWindow: Duration.minutes(1),
      maxConcurrency: 2, // TODO remove if backlog is too big
      reportBatchItemFailures: true,
    })
  );

  // Incase events need to be chained
  eventBus.grantPutEventsTo(plutomiEventConsumerFunction);
};
