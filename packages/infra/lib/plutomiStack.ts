import { type StackProps, Stack } from "aws-cdk-lib";
import type { Construct } from "constructs";
import {
  createVpc,
  getHostedZone,
  createDistribution,
  createCertificate,
  createSesConfig,
  createPlutomiService,
  createTaskDefinition
} from "../utils";

type PlutomiStackProps = StackProps;

export class PlutomiStack extends Stack {
  constructor(scope: Construct, id: string, props?: PlutomiStackProps) {
    super(scope, id, props);

    const { vpc, natGatewayProvider } = createVpc({ stack: this });
    const taskDefinition = createTaskDefinition({
      stack: this
    });
    const hostedZone = getHostedZone({ stack: this });
    const certificate = createCertificate({ stack: this, hostedZone });
    const ec2Service = createPlutomiService({
      stack: this,
      vpc,
      taskDefinition,
      natGatewayProvider,
      certificate
    });

    // createSesConfig({ stack: this, hostedZone });

    // createDistribution({
    //   stack: this,
    //   certificate,
    //   ec2Service,
    //   hostedZone
    // });
  }
}
