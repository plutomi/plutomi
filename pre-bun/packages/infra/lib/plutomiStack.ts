import { type StackProps, Stack } from "aws-cdk-lib";
import type { Construct } from "constructs";
import {
  createTaskRole,
  createTaskDefinition,
  createVpc,
  createFargateService,
  getHostedZone,
  createDistribution,
  createCertificate,
  createSesConfig
} from "../utils";

type PlutomiStackProps = StackProps;

export class PlutomiStack extends Stack {
  constructor(scope: Construct, id: string, props?: PlutomiStackProps) {
    super(scope, id, props);

    const { vpc, natGatewayProvider } = createVpc({ stack: this });
    const taskRole = createTaskRole({ stack: this });
    const taskDefinition = createTaskDefinition({ stack: this, taskRole });
    const hostedZone = getHostedZone({ stack: this });
    const certificate = createCertificate({ stack: this, hostedZone });
    const fargateService = createFargateService({
      stack: this,
      taskDefinition,
      certificate,
      vpc,
      natGatewayProvider
    });

    createSesConfig({ stack: this, hostedZone });

    createDistribution({
      stack: this,
      certificate,
      fargateService,
      hostedZone
    });
  }
}
