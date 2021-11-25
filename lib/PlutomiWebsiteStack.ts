import * as cdk from "@aws-cdk/core";
import * as ecs from "@aws-cdk/aws-ecs";
import * as ec2 from "@aws-cdk/aws-ec2";
import * as ecsPatterns from "@aws-cdk/aws-ecs-patterns";
import * as route53 from "@aws-cdk/aws-route53";
import * as protocol from "@aws-cdk/aws-elasticloadbalancingv2";
import * as iam from "@aws-cdk/aws-iam";
require("dotenv").config();
import { get } from "env-var";
export default class PlutomiWebsiteStack extends cdk.Stack {
  /**
   *
   * @param {cdk.Construct} scope
   * @param {string} id
   * @param {cdk.StackProps=} props
   */
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const HOSTED_ZONE_ID: string = get("HOSTED_ZONE_ID").required().asString();
    const DOMAIN_NAME: string = get("DOMAIN_NAME").required().asString();
    const AWS_ACCOUNT_ID: string = get("AWS_ACCOUNT_ID").required().asString();

    // Get table name from the DynamoDBStack
    const TABLE_NAME = cdk.Fn.importValue("DynamoDB-Table-Name");

    // IAM inline role - the service principal is required
    const taskRole = new iam.Role(this, "plutomi-website-role", {
      assumedBy: new iam.ServicePrincipal("ecs-tasks.amazonaws.com"),
    });

    // Allows Fargate to access DynamoDB
    taskRole.addToPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          "dynamodb:BatchGetItem",
          "dynamodb:BatchWriteItem",
          "dynamodb:PutItem",
          "dynamodb:DeleteItem",
          "dynamodb:GetItem",
          "dynamodb:Query",
          "dynamodb:UpdateItem",
        ],
        resources: [
          `arn:aws:dynamodb:*:${AWS_ACCOUNT_ID}:table/${TABLE_NAME}/index/GSI1`,
          `arn:aws:dynamodb:*:${AWS_ACCOUNT_ID}:table/${TABLE_NAME}/index/GSI2`,
          `arn:aws:dynamodb:*:${AWS_ACCOUNT_ID}:table/${TABLE_NAME}`,
        ],
      })
    );

    // Allows Fargate to send emails
    taskRole.addToPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ["ses:SendEmail"],
        resources: [
          `arn:aws:ses:us-east-1:${AWS_ACCOUNT_ID}:identity/${DOMAIN_NAME}`, // TODO add  Dynamic region
        ],
      })
    );

    // Define a fargate task with the newly created execution and task roles
    const taskDefinition = new ecs.FargateTaskDefinition(
      this,
      "plutomi-website-definition",
      {
        taskRole: taskRole,
        executionRole: taskRole,
      }
    );

    const container = taskDefinition.addContainer("plutomi-website-container", {
      // Get the local docker image, build and deploy it
      image: ecs.ContainerImage.fromAsset("."),
      logging: new ecs.AwsLogDriver({
        streamPrefix: "plutomi-website-log-prefix",
      }),
    });

    container.addPortMappings({
      containerPort: 3000, // NextJS default!
      hostPort: 3000, // NextJS default!
      protocol: ecs.Protocol.TCP,
    });

    // Create a VPC with 2 AZ's (2 is minimum)
    const vpc = new ec2.Vpc(this, "plutomi-website-vpc", {
      maxAzs: 2,
      natGateways: 0, // Very pricy!
    });

    // Create the cluster
    const cluster = new ecs.Cluster(this, "plutomi-website-cluster", {
      vpc,
    });

    // Get a reference to AN EXISTING hosted zone
    const hostedZone = route53.HostedZone.fromHostedZoneAttributes(
      this,
      "plutomi-hosted-zone",
      {
        hostedZoneId: HOSTED_ZONE_ID,
        zoneName: DOMAIN_NAME,
      }
    );

    // Create a load-balanced Fargate service and make it public with HTTPS traffic only
    const website = new ecsPatterns.ApplicationLoadBalancedFargateService(
      this,
      "PlutomiFargateWebsite",
      {
        cluster: cluster, // Required
        cpu: 256, // Default is 256
        desiredCount: 1, // Default is 1
        taskDefinition: taskDefinition,
        memoryLimitMiB: 512, // Default is 512
        publicLoadBalancer: true, // Default is false
        domainName: DOMAIN_NAME,
        domainZone: hostedZone,
        listenerPort: 443,
        protocol: protocol.ApplicationProtocol.HTTPS,
        redirectHTTP: true,
        assignPublicIp: true, // Allows pulling the ECR image
      }
    );

    // TODO TODO TODO add cloudfront for all non /api/ routes https://github.com/plutomi/plutomi/issues/252
    // Get an existing certificate
    // const cert = acm.Certificate.fromCertificateArn(
    //   this,
    //   "name",
    //   "ARN"
    // );

    // Create a cloudfront distribution that has our load balancer as an origin
    // const cfn = new cloudfront.Distribution(
    //   this,
    //   "plutomi-cloudfront-distribution",
    //   {
    //     domainNames: [DOMAIN_NAME, `www.${DOMAIN_NAME}`],
    //     certificate: cert,
    //     defaultBehavior: {
    //       origin: new origins.HttpOrigin("fargate.plutomi.com"),
    //     },
    //   }
    // );

    // Add an A record to our hosted zone that points to our cloudfront distribution
    // new route53.ARecord(this, "CDNARecord", {
    //   zone: hostedZone,
    //   target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(cfn)),
    // });
  }
}
