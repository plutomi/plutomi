import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { configureSES } from "./configureSES";
import { createEventsQueue } from "./createEventsQueue";

export class PlutomiStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const eventsQueue = createEventsQueue({
      stack: this,
    });

    configureSES({
      stack: this,
      eventsQueue,
    });
  }
}
