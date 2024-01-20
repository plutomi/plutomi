import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { setupSES } from "./setupSES";
import { createVpc } from "./createVpc";
import { createTaskRole } from "./createTaskRole";
import { createTaskDefinition } from "./createTaskDefinition";
import { createFargateService } from "./createFargateService";
import { env } from "../utils/env";
import { createEventsArchitecture } from "./createEventsArchitecture";

export class PlutomiStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    setupSES({
      stack: this,
    });
    const { vpc, natGatewayProvider } = createVpc({ stack: this });
    const taskRole = createTaskRole({ stack: this });
    const taskDefinition = createTaskDefinition({ stack: this, taskRole });

    createEventsArchitecture({ stack: this });

    createFargateService({
      stack: this,
      taskDefinition,
      vpc,
      natGatewayProvider,
    });
  }
}
