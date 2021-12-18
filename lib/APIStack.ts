import * as dotenv from "dotenv";
import * as cdk from "@aws-cdk/core";
import * as ecs from "@aws-cdk/aws-ecs";
import * as ec2 from "@aws-cdk/aws-ec2";
import * as ecsPatterns from "@aws-cdk/aws-ecs-patterns";
import * as route53 from "@aws-cdk/aws-route53";
import * as protocol from "@aws-cdk/aws-elasticloadbalancingv2";
import * as dynamodb from "@aws-cdk/aws-dynamodb";
import * as iam from "@aws-cdk/aws-iam";

const resultDotEnv = dotenv.config({
  path: __dirname + `../../.env.${process.env.NODE_ENV}`,
});

if (resultDotEnv.error) {
  throw resultDotEnv.error;
}

interface APIStackProps extends cdk.StackProps {
  table: dynamodb.Table;
}
export default class APIStack extends cdk.Stack {
  /**
   *
   * @param {cdk.Construct} scope
   * @param {string} id
   * @param {cdk.StackProps=} props
   */
  constructor(scope: cdk.App, id: string, props: APIStackProps) {
    super(scope, id, props);

    const HOSTED_ZONE_ID: string = process.env.HOSTED_ZONE_ID;
    const AWS_ACCOUNT_ID: string = process.env.AWS_ACCOUNT_ID;

    // IAM inline role - the service principal is required
    const taskRole = new iam.Role(this, "plutomi-api-fargate-role", {
      assumedBy: new iam.ServicePrincipal("ecs-tasks.amazonaws.com"),
    });

    // Allows Fargate to access DynamoDB
    props.table.grantReadWriteData(taskRole);

    const SES_DOMAIN = "plutomi.com"; // TODO remove once stream processor is implemented
    // Allows Fargate to send emails
    taskRole.addToPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ["ses:SendEmail"],
        resources: [
          `arn:aws:ses:us-east-1:${AWS_ACCOUNT_ID}:identity/${SES_DOMAIN}`,
        ],
      })
    );

    // Define a fargate task with the newly created execution and task roles
    const taskDefinition = new ecs.FargateTaskDefinition(
      this,
      "plutomi-api-fargate-task-definition",
      {
        taskRole: taskRole, // Send email, dynamo, etc.
        // TODO ^ Edit above when email is decoupled
        executionRole: taskRole, // TODO I think this one is just for pulling ECR
        cpu: 256, // Default is 256
        memoryLimitMiB: 512, // Default is 512
      }
    );

    const container = taskDefinition.addContainer(
      "plutomi-api-fargate-container",
      {
        // Get the local docker image, build and deploy it
        image: ecs.ContainerImage.fromAsset("."),
        logging: new ecs.AwsLogDriver({
          streamPrefix: "plutomi-api-fargate",
        }),
      }
    );

    container.addPortMappings({
      containerPort: parseInt(process.env.EXPRESS_PORT) || 4000,
      protocol: ecs.Protocol.TCP,
    });

    // Create a VPC with 2 AZ's (2 is minimum)
    const vpc = new ec2.Vpc(this, "plutomi-api-fargate-vpc", {
      maxAzs: 2,
      natGateways: 0, // Very pricy!
    });

    // Create the cluster
    const cluster = new ecs.Cluster(this, "plutomi-api-fargate-cluster", {
      vpc,
    });

    // Get a reference to AN EXISTING hosted zone
    const hostedZone = route53.HostedZone.fromHostedZoneAttributes(
      this,
      "plutomi-hosted-zone",
      {
        hostedZoneId: HOSTED_ZONE_ID,
        zoneName: process.env.DOMAIN_NAME,
      }
    );

    // Create a load-balanced Fargate service and make it public with HTTPS traffic only
    const loadBalancedFargateService =
      new ecsPatterns.ApplicationLoadBalancedFargateService(
        this,
        "PlutomiApi",
        {
          cluster: cluster, // Required
          taskDefinition: taskDefinition,
          publicLoadBalancer: true, // Default is false
          domainName: process.env.API_DOMAIN_NAME,
          domainZone: hostedZone,
          listenerPort: 443,
          protocol: protocol.ApplicationProtocol.HTTPS,
          redirectHTTP: true,
          assignPublicIp: true, // TODO revisit this
        }
      );
    /**
     * Reduce deploy time by:
     * 1. Lowering the deregistration delay from 300 seconds to 30
     * 2. Lower the healthcheck thresholds for a healthy instance
     *
     * https://github.com/plutomi/plutomi/issues/406
     *
     */
    // Deregistration delay
    loadBalancedFargateService.targetGroup.setAttribute(
      "deregistration_delay.timeout_seconds",
      "30"
    );
    // Healthcheck thresholds
    loadBalancedFargateService.targetGroup.configureHealthCheck({
      interval: cdk.Duration.seconds(5),
      healthyHttpCodes: "200",
      healthyThresholdCount: 2,
      unhealthyThresholdCount: 3,
      timeout: cdk.Duration.seconds(4),
    });

    // Auto scaling
    const scalableTarget =
      loadBalancedFargateService.service.autoScaleTaskCount({
        minCapacity: 1,
        maxCapacity: 1,
      });

    scalableTarget.scaleOnCpuUtilization("CpuScaling", {
      targetUtilizationPercent: 50,
    });

    scalableTarget.scaleOnMemoryUtilization("MemoryScaling", {
      targetUtilizationPercent: 50,
    });
  }
}
