import { Duration, Stack } from "aws-cdk-lib";
import { EventBus } from "aws-cdk-lib/aws-events";

const eventBusName = "plutomi-event-bus";
const archiveName = "plutomi-event-archive";

type CreateEventBusProps = {
  stack: Stack;
};

/**
 *
 * Creates a custom event bus to process Plutomi events.
 */
export const createEventBus = ({ stack }: CreateEventBusProps): EventBus => {
  const bus = new EventBus(stack, eventBusName, {
    eventBusName,
  });

  bus.archive(archiveName, {
    archiveName,
    description: "Archive for Plutomi events",
    eventPattern: {
      account: [stack.account],
    },
    retention: Duration.days(365),
  });

  return bus;
};
