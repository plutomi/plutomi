import { type StackProps, Stack } from "aws-cdk-lib";
import type { Construct } from "constructs";
import {
  createTaskRole,
  createTaskDefinition,
  createVpc,
  createFargateService,
  getHostedZone,
  createDistribution,
  createDynamoTable
} from "../utils";
import { getACMCertificate } from "../utils/getAcmCertificate";

type PlutomiStackProps = StackProps;

export class PlutomiStack extends Stack {
  constructor(scope: Construct, id: string, props?: PlutomiStackProps) {
    super(scope, id, props);

    const { vpc, natGatewayProvider } = createVpc({ stack: this });
    const taskRole = createTaskRole({ stack: this });
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

    createDynamoTable({ stack: this, taskRole });

    createDistribution({
      stack: this,
      certificate,
      fargateService,
      hostedZone
    });

    // ! TODO:
    // // Allows fargate to send emails
    // const sesSendEmailPolicy = new iam.PolicyStatement({
    //   effect: iam.Effect.ALLOW,
    //   actions: [
    //     Policies.SendEmail,
    //     Policies.SendRawEmail,
    //     Policies.SendTemplatedEmail
    //   ],
    //   resources: [
    //     `arn:aws:ses:${this.region}:${
    //       cdk.Stack.of(this).account
    //     }:identity/${DOMAIN_NAME}`
    //   ]
    // });

    // const policy = new Policy(
    //   this,
    //   `${envVars.NEXT_PUBLIC_DEPLOYMENT_ENVIRONMENT}-plutomi-api-policy`,
    //   {
    //     statements: [sesSendEmailPolicy]
    //   }
    // );
    // taskRole.attachInlinePolicy(policy);
  }
}
