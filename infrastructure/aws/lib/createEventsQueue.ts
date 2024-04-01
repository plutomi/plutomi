import { Duration, Stack } from "aws-cdk-lib";
import { Queue } from "aws-cdk-lib/aws-sqs";

const eventsQueueName = `events-queue`;

type CreateEventsQueueProps = {
  stack: Stack;
};

/**
 * Creates an SQS queue for SES and Plutomi app events.
 * For now, only one queue is fine. In the future we can split them up if needed.
 */
export const createEventsQueue = ({ stack }: CreateEventsQueueProps) => {
  const eventsQueue = new Queue(stack, eventsQueueName, {
    queueName: eventsQueueName,
    retentionPeriod: Duration.days(14),
    visibilityTimeout: Duration.seconds(30),
    // Long polling
    receiveMessageWaitTime: Duration.seconds(20),
  });

  return eventsQueue;
};
