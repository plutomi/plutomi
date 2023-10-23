import { Stack, StackProps } from "aws-cdk-lib";

import { Construct } from "constructs";
import { setupSES } from "./setupSES";

export class PlutomiStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    setupSES({ stack: this });
  }
}
