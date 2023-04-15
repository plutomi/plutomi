import { type StackProps, Stack } from "aws-cdk-lib";
import type { Construct } from "constructs";
import { ARecord, RecordTarget } from "aws-cdk-lib/aws-route53";
import { CloudFrontTarget } from "aws-cdk-lib/aws-route53-targets";
import {
  createTaskRole,
  createTaskDefinition,
  createVpc,
  createCluster,
  createFargateService,
  getHostedZone,
  createWaf,
  createDistribution
} from "../utils";
import { getACMCertificate } from "../utils/getAcmCertificate";
import { allEnvVariables } from "../env";

type PlutomiStackProps = StackProps;

export class PlutomiStack extends Stack {
  constructor(scope: Construct, id: string, props?: PlutomiStackProps) {
    super(scope, id, props);

    const vpc = createVpc({ stack: this });
    const taskRole = createTaskRole({ stack: this });
    const taskDefinition = createTaskDefinition({ stack: this, taskRole });
    const cluster = createCluster({ stack: this, vpc });
    const hostedZone = getHostedZone({ stack: this });
    const certificate = getACMCertificate({ stack: this });
    const fargateService = createFargateService({
      stack: this,
      cluster,
      taskDefinition,
      certificate
    });

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

    const waf = createWaf({
      stack: this
    });
    const cfDistribution = createDistribution({
      stack: this,
      certificate,
      fargateService,
      waf
    });

    //  Creates an A record that points our API domain to Cloudfront
    new ARecord(this, `APIAlias`, {
      recordName: allEnvVariables.DOMAIN,
      zone: hostedZone,
      target: RecordTarget.fromAlias(new CloudFrontTarget(distribution))
    });
  }
}
