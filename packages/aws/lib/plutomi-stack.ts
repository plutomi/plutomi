import { Stack, StackProps } from "aws-cdk-lib";

import { Construct } from "constructs";
import { setupSES } from "./setupSES";

const deploymentEnvironment =
  process.env.DEPLOYMENT_ENVIRONMENT || "development";

export class PlutomiStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    setupSES({ stack: this, deploymentEnvironment });
  }
}
