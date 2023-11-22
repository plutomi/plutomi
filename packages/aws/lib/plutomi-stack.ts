import { Stack, StackProps } from "aws-cdk-lib";

import { Construct } from "constructs";
import { setupSES } from "./setupSES";
import { SqsQueue } from "aws-cdk-lib/aws-events-targets";
import { Queue } from "aws-cdk-lib/aws-sqs";
import { createVpc } from "./createVpc";
import { createTaskRole } from "./createTaskRole";
import { createTaskDefinition } from "./createTaskDefinition";
import { createFargateService } from "./createFargateService";

const deploymentEnvironment = process.env.NEXT_PUBLIC_DEPLOYMENT_ENVIRONMENT;

export class PlutomiStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    console.log("Deployment Environment:", deploymentEnvironment); // For debugging

    console.log("Deployment Environment:", deploymentEnvironment); // For debugging
    console.log("Deployment Environment:", deploymentEnvironment); // For debugging
    console.log("Deployment Environment:", deploymentEnvironment); // For debugging

    if (!deploymentEnvironment)
      throw new Error("No NEXT_PUBLIC_DEPLOYMENT_ENVIRONMENT variable set!");

    // @ts-ignore
    setupSES({ stack: this, deploymentEnvironment });
    const { vpc, natGatewayProvider } = createVpc({ stack: this });
    const taskRole = createTaskRole({ stack: this });
    const taskDefinition = createTaskDefinition({ stack: this, taskRole });
    const fargateService = createFargateService({
      stack: this,
      taskDefinition,
      // certificate,
      vpc,
      natGatewayProvider,
    });
  }
}
