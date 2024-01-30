import { Duration, type Stack } from "aws-cdk-lib";
import type { EventBus } from "aws-cdk-lib/aws-events";
import { Architecture, Code, Runtime } from "aws-cdk-lib/aws-lambda";
import { SqsEventSource } from "aws-cdk-lib/aws-lambda-event-sources";
import { Function } from "aws-cdk-lib/aws-lambda";
import { Queue } from "aws-cdk-lib/aws-sqs";
import path = require("path");
import { env } from "../utils/env";
import type { Vpc } from "aws-cdk-lib/aws-ec2";

type CreateEventsConsumerProps = {
  stack: Stack;
  eventBus: EventBus;
  vpc: Vpc;
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
  vpc,
}: CreateEventsConsumerProps) => {
  const eventConsumerQueue = new Queue(stack, queueName, {
    queueName,
    retentionPeriod: Duration.days(14),
    visibilityTimeout: Duration.seconds(30),
    // Long polling
    receiveMessageWaitTime: Duration.seconds(20),
  });

  const plutomiEventConsumerFunction = new Function(stack, eventConsumerName, {
    runtime: Runtime.PROVIDED_AL2,
    handler: "main",
    functionName: eventConsumerName,
    memorySize: 128,
    vpc,
    timeout: Duration.seconds(30),
    architecture: Architecture.ARM_64,
    // This needs to be higher than maxConcurrency in the event source
    reservedConcurrentExecutions: 3,
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
  });

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

  // Incase events need to be chained, allow the lambda function to put events back into the event bus if needed
  // For example, we might consume a scheduledRule.deleted event so we should delete any pending scheduled events for that rule
  // ie: If a rule exists like "Move applicants to the next stage if idle for 30 days"
  // but then that rule is deleted, we no longer want to do take action on it so we should delete all scheduled events
  eventBus.grantPutEventsTo(plutomiEventConsumerFunction);

  return plutomiEventConsumerFunction;
};
