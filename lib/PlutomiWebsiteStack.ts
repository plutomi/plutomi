import * as cdk from "@aws-cdk/core";
import * as ecs from "@aws-cdk/aws-ecs";
import * as ec2 from "@aws-cdk/aws-ec2";
import * as ecr from "@aws-cdk/aws-ecr";
import * as ecs_patterns from "@aws-cdk/aws-ecs-patterns";
import * as route53 from "@aws-cdk/aws-route53";
import * as cloudfront from "@aws-cdk/aws-cloudfront";
import * as acm from "@aws-cdk/aws-certificatemanager";
import * as origins from "@aws-cdk/aws-cloudfront-origins";
import * as protocol from "@aws-cdk/aws-elasticloadbalancingv2";
import * as ssm from "@aws-cdk/aws-ssm";
import * as iam from "@aws-cdk/aws-iam";

export default class PlutomiWebsiteStack extends cdk.Stack {
  /**
   *
   * @param {cdk.Construct} scope
   * @param {string} id
   * @param {cdk.StackProps=} props
   */
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const HOSTED_ZONE_ID = ssm.StringParameter.fromStringParameterAttributes(
      this,
      "plutomi-hosted-zone-id",
      {
        parameterName: "/plutomi/HOSTED_ZONE_ID",
      }
    ).stringValue;

    const DOMAIN_NAME = ssm.StringParameter.fromStringParameterAttributes(
      this,
      "plutomi-domain-name",
      {
        parameterName: "/plutomi/DOMAIN_NAME",
      }
    ).stringValue;

    const ACCOUNT_ID = ssm.StringParameter.fromStringParameterAttributes(
      this,
      "plutomi-account-id",
      {
        parameterName: "/plutomi/ACCOUNT_ID",
      }
    ).stringValue;

    // IAM inline role - the service principal is required
    const taskRole = new iam.Role(this, "plutomi-fargate-api-role", {
      assumedBy: new iam.ServicePrincipal("ecs-tasks.amazonaws.com"),
    });

    // Add Dynamo access policy
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
          `arn:aws:dynamodb:*:${ACCOUNT_ID}:table/Plutomi/index/GSI1`, // TODO dynamic table name
          `arn:aws:dynamodb:*:${ACCOUNT_ID}:table/Plutomi/index/GSI2`, // TODO dynamic table name
          `arn:aws:dynamodb:*:${ACCOUNT_ID}:table/Plutomi`, // TODO dynamic table name
        ],
      })
    );

    // Define a fargate task with the newly created execution and task roles
    const taskDefinition = new ecs.FargateTaskDefinition(
      this,
      "plutomi-fargate-api-definition",
      {
        taskRole: taskRole,
        executionRole: taskRole,
      }
    );

    // For private ECR repositories, you must set this or you'll receive an error
    // TODO remove and have CDK deploy automatically
    // https://github.com/plutomi/plutomi/issues/255
    const repository = ecr.Repository.fromRepositoryName(
      this,
      "plutomi-fargate-api-repository",
      "plutomi"
    );

    // TODO remove and have cdk build and deploy
    // https://github.com/plutomi/plutomi/issues/255
    const image = ecs.ContainerImage.fromEcrRepository(repository, "latest");

    const container = taskDefinition.addContainer(
      "plutomi-fargate-api-container",
      {
        image: image,
        logging: new ecs.AwsLogDriver({
          streamPrefix: "plutomi-fargate-api-log-prefix",
        }),
      }
    );

    container.addPortMappings({
      containerPort: 3000, // NextJS default!
      hostPort: 3000, // NextJS default!
      protocol: ecs.Protocol.TCP,
    });

    // Create a VPC with 2 AZ's (2 is minimum)
    const vpc = new ec2.Vpc(this, "plutomi-fargate-api-vpc", {
      maxAzs: 2,
      natGateways: 0, // Very pricy!
    });

    // Create the cluster
    const cluster = new ecs.Cluster(this, "plutomi-fargate-api-cluster", {
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
    const website = new ecs_patterns.ApplicationLoadBalancedFargateService(
      this,
      "PlutomiFargateWebsite",
      {
        cluster: cluster, // Required
        cpu: 256, // Default is 256
        desiredCount: 1, // Default is 1
        taskDefinition: taskDefinition,
        memoryLimitMiB: 512, // Default is 512
        publicLoadBalancer: true, // Default is false
        domainName: `fargate.${DOMAIN_NAME}`,
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
