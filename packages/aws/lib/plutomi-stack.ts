import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { env } from "../utils/env";
import { configureSES } from "./configureSES";
import { createEventsQueue } from "./createEventsQueue";
import { createS3Bucket } from "./createS3Bucket";

export class PlutomiStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const eventsQueue = createEventsQueue({
      stack: this,
    });

    createS3Bucket({
      stack: this,
      eventsQueue,
    });

    configureSES({
      stack: this,
      eventsQueue,
    });
  }
}
