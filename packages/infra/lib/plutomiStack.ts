import { type StackProps, Stack } from "aws-cdk-lib";
import type { Construct } from "constructs";
import {
  createTaskRole,
  createTaskDefinition,
  createVpc,
  createFargateService,
  getHostedZone,
  createDistribution
} from "../utils";
import { getACMCertificate } from "../utils/getAcmCertificate";
import { createSESPolicy } from "../utils/createSESPolicy";

type PlutomiStackProps = StackProps;

export class PlutomiStack extends Stack {
  constructor(scope: Construct, id: string, props?: PlutomiStackProps) {
    super(scope, id, props);

    const SESPolicy = createSESPolicy({ stack: this });
    const { vpc, natGatewayProvider } = createVpc({ stack: this });
    const taskRole = createTaskRole({ stack: this, SESPolicy });
    const taskDefinition = createTaskDefinition({ stack: this, taskRole });
    const hostedZone = getHostedZone({ stack: this });
    const certificate = getACMCertificate({ stack: this });
    const fargateService = createFargateService({
      stack: this,
      taskDefinition,
      certificate,
      vpc,
      natGatewayProvider
    });

    createDistribution({
      stack: this,
      certificate,
      fargateService,
      hostedZone
    });
  }
}
