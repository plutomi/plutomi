import { type StackProps, Stack } from "aws-cdk-lib";
import type { Construct } from "constructs";
import {
  createVpc,
  getHostedZone,
  createDistribution,
  createCertificate,
  createSesConfig,
  createEc2Service,
  createEc2TaskDefinition
} from "../utils";

type PlutomiStackProps = StackProps;

export class PlutomiStack extends Stack {
  constructor(scope: Construct, id: string, props?: PlutomiStackProps) {
    super(scope, id, props);

    const { vpc, natGatewayProvider } = createVpc({ stack: this });
    const taskDefinition = createEc2TaskDefinition({
      stack: this
    });
    const hostedZone = getHostedZone({ stack: this });
    const certificate = createCertificate({ stack: this, hostedZone });
    const ec2Service = createEc2Service({
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
