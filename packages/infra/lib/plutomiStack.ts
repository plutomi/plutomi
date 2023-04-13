import * as cf from "aws-cdk-lib/aws-cloudfront";
import * as ecsPatterns from "aws-cdk-lib/aws-ecs-patterns";
import * as cdk from "aws-cdk-lib";
import * as ecs from "aws-cdk-lib/aws-ecs";
import { FckNatInstanceProvider } from "cdk-fck-nat";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as iam from "aws-cdk-lib/aws-iam";
import * as route53 from "aws-cdk-lib/aws-route53";
import * as origins from "aws-cdk-lib/aws-cloudfront-origins";
import { Certificate } from "aws-cdk-lib/aws-certificatemanager";
import { ARecord, RecordTarget } from "aws-cdk-lib/aws-route53";
import { CloudFrontTarget } from "aws-cdk-lib/aws-route53-targets";
import { Policy } from "aws-cdk-lib/aws-iam";
import * as waf from "aws-cdk-lib/aws-wafv2";
import { InstanceClass, InstanceSize, InstanceType } from "aws-cdk-lib/aws-ec2";
import { Construct } from "constructs";

interface PlutomiStackProps extends cdk.StackProps {}

export class PlutomiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: PlutomiStackProps) {
    super(scope, id, props);

    // IAM inline role - the service principal is required
    const taskRole = new iam.Role(this, "plutomi-api-fargate-role", {
      assumedBy: new iam.ServicePrincipal("ecs-tasks.amazonaws.com"),
    });

    // Allows fargate to send emails
    const sesSendEmailPolicy = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        Policies.SendEmail,
        Policies.SendRawEmail,
        Policies.SendTemplatedEmail,
      ],
      resources: [
        `arn:aws:ses:${this.region}:${
          cdk.Stack.of(this).account
        }:identity/${DOMAIN_NAME}`,
      ],
    });

    const policy = new Policy(
      this,
      `${envVars.NEXT_PUBLIC_DEPLOYMENT_ENVIRONMENT}-plutomi-api-policy`,
      {
        statements: [sesSendEmailPolicy],
      },
    );
    taskRole.attachInlinePolicy(policy);
    // Define a fargate task with the newly created execution and task roles
    const taskDefinition = new ecs.FargateTaskDefinition(
      this,
      "plutomi-api-fargate-task-definition",
      {
        taskRole,
        executionRole: taskRole,
        cpu: 256,
        memoryLimitMiB: 512,
      },
    );

    const container = taskDefinition.addContainer(
      "plutomi-api-fargate-container",
      {
        // Get the local docker image, build and deploy it
        image: ecs.ContainerImage.fromAsset(".", {
          // ! Must match the ARGs in the docker file!
          buildArgs: {
            COMMITS_TOKEN: envVars.COMMITS_TOKEN,
            NEXT_PUBLIC_DEPLOYMENT_ENVIRONMENT:
              envVars.NEXT_PUBLIC_DEPLOYMENT_ENVIRONMENT,
            NEXT_PUBLIC_WEBSITE_URL: envVars.NEXT_PUBLIC_WEBSITE_URL,
          },
        }),

        logging: new ecs.AwsLogDriver({
          streamPrefix: "plutomi-api-fargate",
        }),
        // TODO vomit
        environment: envVars as unknown as { [key: string]: string },
      },
    );

    container.addPortMappings({
      // TODO i think this cdk type is wrong? Says should be a number but got:
      // supplied properties not correct for "KeyValuePairProperty" value: 3000 should be a string.
      containerPort: Number(envVars.PORT),
    });

    // https://fck-nat.dev/
    const natGatewayProvider = new FckNatInstanceProvider({
      instanceType: InstanceType.of(InstanceClass.T4G, InstanceSize.NANO),
    });

    // TODO  add fck nat
    const vpc = new ec2.Vpc(this, "plutomi-api-fargate-vpc", {
      maxAzs: Servers.vpc.az,
      natGateways: Servers.vpc.natGateways, // Very pricy! https://www.lastweekinaws.com/blog/the-aws-managed-nat-gateway-is-unpleasant-and-not-recommended/
      natGatewayProvider,
    });

    const cluster = new ecs.Cluster(this, "plutomi-api-fargate-cluster", {
      vpc,
      containerInsights: true,
    });

    // Get a reference to AN EXISTING hosted zone
    const hostedZone = route53.HostedZone.fromHostedZoneAttributes(
      this,
      "plutomi-hosted-zone",
      {
        hostedZoneId: envVars.HOSTED_ZONE_ID,
        zoneName: DOMAIN_NAME,
      },
    );

    // Retrieves the certificate that we are using for our domain
    const apiCert = Certificate.fromCertificateArn(
      this,
      `CertificateArn`,
      `arn:aws:acm:${this.region}:${this.account}:certificate/${envVars.ACM_CERTIFICATE_ID}`,
    );

    /**
     * Creates a load balanced fargate service.
     * The load balancer will be in a public subnet, while the tasks will be in a private subnet and unaccessible from the internet.
     *
     * The fck-nat allows internet access to the tasks.
     */
    const loadBalancedFargateService =
      new ecsPatterns.ApplicationLoadBalancedFargateService(
        this,
        "PlutomiApi",
        {
          cluster,
          certificate: apiCert,
          taskDefinition,
          desiredCount: Servers.count.min,
          listenerPort: 443,
          redirectHTTP: true,
        },
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
      "10",
    );
    // Healthcheck thresholds
    loadBalancedFargateService.targetGroup.configureHealthCheck({
      interval: cdk.Duration.seconds(5),
      healthyThresholdCount: 2,
      unhealthyThresholdCount: 2,
      timeout: cdk.Duration.seconds(4),
    });

    // Auto scaling
    const scalableTarget =
      loadBalancedFargateService.service.autoScaleTaskCount({
        minCapacity: Servers.count.min,
        maxCapacity: Servers.count.max,
      });

    /**
     * Good reading on fargate 25% time :>
     * https://github.com/aws/containers-roadmap/issues/163
     */
    scalableTarget.scaleOnCpuUtilization("CpuScaling", {
      targetUtilizationPercent: Servers.targetUtilizationPct,
    });

    // Create the WAF & its rules
    // TODO move this out
    const API_WAF = new waf.CfnWebACL(
      this,
      `${envVars.NEXT_PUBLIC_DEPLOYMENT_ENVIRONMENT}-API-WAF`,
      {
        name: `${envVars.NEXT_PUBLIC_DEPLOYMENT_ENVIRONMENT}-API-WAF`,
        description: "Blocks IPs that make too many requests",
        defaultAction: {
          allow: {},
        },
        scope: "CLOUDFRONT",
        visibilityConfig: {
          cloudWatchMetricsEnabled: true,
          metricName: "cloudfront-ipset-waf",
          sampledRequestsEnabled: true,
        },
        rules: [
          {
            name: `too-many-api-requests-rule`,
            priority: 0,
            statement: {
              rateBasedStatement: {
                limit: Servers.rateLimit.api, // In a 5 minute period
                aggregateKeyType: "IP",
                scopeDownStatement: {
                  byteMatchStatement: {
                    fieldToMatch: {
                      uriPath: {},
                    },
                    positionalConstraint: "CONTAINS",
                    textTransformations: [
                      {
                        priority: 0,
                        type: "LOWERCASE",
                      },
                    ],
                    searchString: "/api/",
                  },
                },
              },
            },
            action: {
              block: {
                customResponse: {
                  responseCode: 429,
                },
              },
            },
            visibilityConfig: {
              sampledRequestsEnabled: true,
              cloudWatchMetricsEnabled: true,
              metricName: `${envVars.NEXT_PUBLIC_DEPLOYMENT_ENVIRONMENT}-WAF-API-BLOCKED-IPs`,
            },
          },
          {
            name: `too-many-web-requests-rule`,
            priority: 1,
            statement: {
              rateBasedStatement: {
                limit: Servers.rateLimit.web, // In a 5 minute period
                aggregateKeyType: "IP",
              },
            },
            action: {
              block: {
                customResponse: {
                  responseCode: 429,
                },
              },
            },
            visibilityConfig: {
              sampledRequestsEnabled: true,
              cloudWatchMetricsEnabled: true,
              metricName: `${envVars.NEXT_PUBLIC_DEPLOYMENT_ENVIRONMENT}-WAF-GENERAL-BLOCKED-IPs`,
            },
          },
          // { // TODO this is blocking postman requests :/
          //   name: "AWS-AWSManagedRulesBotControlRuleSet",
          //   priority: 1,
          //   statement: {
          //     managedRuleGroupStatement: {
          //       vendorName: "AWS",
          //       name: "AWSManagedRulesBotControlRuleSet",
          //     },
          //   },
          //   overrideAction: {
          //     none: {},
          //   },
          //   visibilityConfig: {
          //     sampledRequestsEnabled: false,
          //     cloudWatchMetricsEnabled: true,
          //     metricName: "AWS-AWSManagedRulesBotControlRuleSet",
          //   },
          // },
          {
            name: "AWS-AWSManagedRulesAmazonIpReputationList",
            priority: 2,
            statement: {
              managedRuleGroupStatement: {
                vendorName: "AWS",
                name: "AWSManagedRulesAmazonIpReputationList",
              },
            },
            overrideAction: {
              none: {},
            },
            visibilityConfig: {
              sampledRequestsEnabled: false,
              cloudWatchMetricsEnabled: true,
              metricName: "AWS-AWSManagedRulesAmazonIpReputationList",
            },
          },
          // {
          // TODO this rule breaks login links, see https://github.com/plutomi/plutomi/issues/510
          //   name: "AWS-AWSManagedRulesCommonRuleSet",
          //   priority: 3,
          //   statement: {
          //     managedRuleGroupStatement: {
          //       vendorName: "AWS",
          //       name: "AWSManagedRulesCommonRuleSet",
          //     },
          //   },
          //   overrideAction: {
          //     none: {},
          //   },
          //   visibilityConfig: {
          //     sampledRequestsEnabled: false,
          //     cloudWatchMetricsEnabled: true,
          //     metricName: "AWS-AWSManagedRulesCommonRuleSet",
          //   },
          // },
        ],
      },
    );

    // No caching! We're using Cloudfront for its global network and WAF
    const cachePolicy = new cf.CachePolicy(
      this,
      `${envVars.NEXT_PUBLIC_DEPLOYMENT_ENVIRONMENT}-Cache-Policy`,
      {
        defaultTtl: cdk.Duration.seconds(0),
        minTtl: cdk.Duration.seconds(0),
        maxTtl: cdk.Duration.seconds(0),
      },
    );

    const distribution = new cf.Distribution(
      this,
      `${envVars.NEXT_PUBLIC_DEPLOYMENT_ENVIRONMENT}-CF-API-Distribution`,
      {
        certificate: apiCert,
        webAclId: API_WAF.attrArn,
        // TODO others?
        domainNames: [
          envVars.NEXT_PUBLIC_DEPLOYMENT_ENVIRONMENT === "stage"
            ? STAGE_DOMAIN_NAME
            : DOMAIN_NAME,
        ],
        defaultBehavior: {
          origin: new origins.LoadBalancerV2Origin(
            loadBalancedFargateService.loadBalancer,
          ),

          // Must be enabled!
          // https://www.reddit.com/r/aws/comments/rhckdm/comment/hoqrjmm/?utm_source=share&utm_medium=web2x&context=3
          originRequestPolicy: cf.OriginRequestPolicy.ALL_VIEWER,
          cachePolicy,
          allowedMethods: cf.AllowedMethods.ALLOW_ALL,
        },
        // additionalBehaviors: {
        // TODO add /public caching behaviors here
        // }, //
      },
    );

    //  Creates an A record that points our API domain to Cloudfront
    new ARecord(this, `APIAlias`, {
      recordName:
        envVars.NEXT_PUBLIC_DEPLOYMENT_ENVIRONMENT === "stage"
          ? STAGE_DOMAIN_NAME
          : DOMAIN_NAME,
      zone: hostedZone,
      target: RecordTarget.fromAlias(new CloudFrontTarget(distribution)),
    });
  }
}
