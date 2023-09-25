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
  createSesConfig,
  createEc2Service,
  createEc2TaskDefinition,
  createEc2Cluster
} from "../utils";

type PlutomiStackProps = StackProps;

export class PlutomiStack extends Stack {
  constructor(scope: Construct, id: string, props?: PlutomiStackProps) {
    super(scope, id, props);

    const { vpc, natGatewayProvider } = createVpc({ stack: this });
    const taskRole = createTaskRole({ stack: this });
    const taskDefinition = createEc2TaskDefinition({
      stack: this,
      taskRole
    });
    const hostedZone = getHostedZone({ stack: this });
    const certificate = createCertificate({ stack: this, hostedZone });
    const cluster = createEc2Cluster({ stack: this, vpc });
    const ec2Service = createEc2Service({
      stack: this,
      cluster,
      taskDefinition,
      natGatewayProvider,
      certificate
    });
    // const fargateService = createFargateService({
    //   stack: this,
    //   taskDefinition,
    //   certificate,
    //   vpc,
    //   natGatewayProvider
    // });

    createSesConfig({ stack: this, hostedZone });

    // createDistribution({
    //   stack: this,
    //   certificate,
    //   fargateService: ec2Service,
    //   hostedZone
    // });
  }
}
