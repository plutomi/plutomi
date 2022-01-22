import * as dotenv from "dotenv";
import * as cf from "@aws-cdk/aws-cloudfront";
import * as waf from "@aws-cdk/aws-wafv2";
import * as cdk from "@aws-cdk/core";
import * as iam from "@aws-cdk/aws-iam";
import * as ecs from "@aws-cdk/aws-ecs";
import * as protocol from "@aws-cdk/aws-elasticloadbalancingv2";
import * as ec2 from "@aws-cdk/aws-ec2";
import * as route53 from "@aws-cdk/aws-route53";
import * as ecsPatterns from "@aws-cdk/aws-ecs-patterns";

import { Table } from "@aws-cdk/aws-dynamodb";
import { Certificate } from "@aws-cdk/aws-certificatemanager";
import { HostedZone, ARecord, RecordTarget } from "@aws-cdk/aws-route53";
import { CloudFrontTarget } from "@aws-cdk/aws-route53-targets";
import * as path from "path";
import { API_DOMAIN, DOMAIN_NAME, EXPRESS_PORT, WEBSITE_URL } from "../Config";
import { Policy, PolicyStatement } from "@aws-cdk/aws-iam";
import { DynamoActions } from "../types/main";
const resultDotEnv = dotenv.config({
  path: `${process.cwd()}/.env.${process.env.NODE_ENV}`,
});

if (resultDotEnv.error) {
  throw resultDotEnv.error;
}

interface APIGatewayServiceProps extends cdk.StackProps {
  table: Table;
}

export default class APIStack extends cdk.Stack {
  constructor(
    scope: cdk.Construct,
    id: string,
    props?: APIGatewayServiceProps
  ) {
    super(scope, id, props);

    const HOSTED_ZONE_ID: string = process.env.HOSTED_ZONE_ID;

    // IAM inline role - the service principal is required
    const taskRole = new iam.Role(this, "plutomi-api-fargate-role", {
      assumedBy: new iam.ServicePrincipal("ecs-tasks.amazonaws.com"),
    });

    // Allows Fargate to access DynamoDB

    const actions: DynamoActions[] = [
      "dynamodb:GetItem",
      "dynamodb:DeleteItem",
      "dynamodb:PutItem",
      "dynamodb:Query",
      "dynamodb:UpdateItem",
    ];

    const baseTable = `arn:aws:dynamodb:${cdk.Stack.of(this).region}:${
      cdk.Stack.of(this).account
    }:table/${props.table.tableName}`;

    const GSI1 = `${baseTable}/index/GSI1`;
    const GSI2 = `${baseTable}/index/GSI2`;
    const resources = [baseTable, GSI1, GSI2];

    const policyStatement = new PolicyStatement({
      actions,
      resources,
    });

    const policy = new Policy(
      this,
      `${process.env.NODE_ENV}-plutomi-api-policy`,
      {
        statements: [policyStatement],
      }
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
      containerPort: EXPRESS_PORT || 4000,
      protocol: ecs.Protocol.TCP,
    });

    // Create a VPC
    const vpc = new ec2.Vpc(this, "plutomi-api-fargate-vpc", {
      maxAzs: 3,
      natGateways: 0, // Very pricy! https://www.lastweekinaws.com/blog/the-aws-managed-nat-gateway-is-unpleasant-and-not-recommended/
    });

    // Create the cluster
    const cluster = new ecs.Cluster(this, "plutomi-api-fargate-cluster", {
      vpc,
      containerInsights: true,
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
    const loadBalancedFargateService =
      new ecsPatterns.ApplicationLoadBalancedFargateService(
        this,
        "PlutomiApi",
        {
          cluster: cluster, // Required
          taskDefinition: taskDefinition,
          publicLoadBalancer: true, // Default is false
          domainName: API_DOMAIN,
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
      targetUtilizationPercent: 35,
    });

    scalableTarget.scaleOnMemoryUtilization("MemoryScaling", {
      targetUtilizationPercent: 35,
    });

    // Below is legacy
    // Retrieves the hosted zone from Route53
    // const hostedZone = HostedZone.fromHostedZoneAttributes(this, `HostedZone`, {
    //   hostedZoneId: process.env.HOSTED_ZONE_ID,
    //   zoneName: DOMAIN_NAME,
    // });

    // // Retrieves the certificate that we are using for our domain
    // const apiCert = Certificate.fromCertificateArn(
    //   this,
    //   `CertificateArn`,
    //   `arn:aws:acm:${this.region}:${this.account}:certificate/${process.env.ACM_CERTIFICATE_ID}`
    // );

    // Create the WAF & WAF Rules
    // const API_WAF = new waf.CfnWebACL(
    //   this,
    //   `${process.env.NODE_ENV}-API-Gateway-WAF`,
    //   {
    //     name: `${process.env.NODE_ENV}-API-Gateway-WAF`,

    //     description:
    //       "This WAF blocks IPs that are making too many requests and sends the logs of those blocks to cloudwatch.",
    //     defaultAction: {
    //       allow: {},
    //     },
    //     scope: "CLOUDFRONT",
    //     visibilityConfig: {
    //       cloudWatchMetricsEnabled: true,
    //       metricName: "cloudfront-ipset-waf",
    //       sampledRequestsEnabled: true,
    //     },
    //     rules: [
    //       {
    //         name: `too-many-requests-rule`,
    //         priority: 0,
    //         statement: {
    //           rateBasedStatement: {
    //             limit: 1000, // In a 5 minute period
    //             aggregateKeyType: "IP",
    //           },
    //         },
    //         action: {
    //           block: {
    //             customResponse: {
    //               responseCode: 429,
    //             },
    //           },
    //         },
    //         visibilityConfig: {
    //           sampledRequestsEnabled: true,
    //           cloudWatchMetricsEnabled: true,
    //           metricName: `${process.env.NODE_ENV}-WAF-BLOCKED-IPs`,
    //         },
    //       },
    //       // { // TODO this is blocking postman requests :/
    //       //   name: "AWS-AWSManagedRulesBotControlRuleSet",
    //       //   priority: 1,
    //       //   statement: {
    //       //     managedRuleGroupStatement: {
    //       //       vendorName: "AWS",
    //       //       name: "AWSManagedRulesBotControlRuleSet",
    //       //     },
    //       //   },
    //       //   overrideAction: {
    //       //     none: {},
    //       //   },
    //       //   visibilityConfig: {
    //       //     sampledRequestsEnabled: false,
    //       //     cloudWatchMetricsEnabled: true,
    //       //     metricName: "AWS-AWSManagedRulesBotControlRuleSet",
    //       //   },
    //       // },
    //       {
    //         name: "AWS-AWSManagedRulesAmazonIpReputationList",
    //         priority: 2,
    //         statement: {
    //           managedRuleGroupStatement: {
    //             vendorName: "AWS",
    //             name: "AWSManagedRulesAmazonIpReputationList",
    //           },
    //         },
    //         overrideAction: {
    //           none: {},
    //         },
    //         visibilityConfig: {
    //           sampledRequestsEnabled: false,
    //           cloudWatchMetricsEnabled: true,
    //           metricName: "AWS-AWSManagedRulesAmazonIpReputationList",
    //         },
    //       },
    // { // TODO this rule breaks login links, see https://github.com/plutomi/plutomi/issues/510
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
    //     ],
    //   }
    // );

    // Creates a Cloudfront distribution so that we can attach a WAF to it.
    // API GatewayV2 does not allow WAF directly at the moment :/
    // const distribution = new cf.CloudFrontWebDistribution(
    //   this,
    //   `${process.env.NODE_ENV}-CF-API-Distribution`,
    //   {
    //     httpVersion: cf.HttpVersion.HTTP2,
    //     priceClass: cf.PriceClass.PRICE_CLASS_ALL,
    //     viewerProtocolPolicy: cf.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,

    //     originConfigs: [
    //       {
    //         customOriginSource: {
    //           /**
    //            * this.api.url & this.api.apiEndpoint were not working:
    //            * Invalid request provided: The parameter origin name cannot contain a colon.
    //            * https://stackoverflow.com/a/57467656
    //            */
    //           domainName: `${this.api.httpApiId}.execute-api.${this.region}.amazonaws.com`,
    //         },
    //         behaviors: [
    //           {
    //             isDefaultBehavior: true,
    //             allowedMethods: cf.CloudFrontAllowedMethods.ALL, // TODO cache /public routes
    //             defaultTtl: cdk.Duration.seconds(0), // NO CACHING!! CF is for WAF only
    //             minTtl: cdk.Duration.seconds(0), // NO CACHING!! CF is for WAF only
    //             maxTtl: cdk.Duration.seconds(0), // NO CACHING!! CF is for WAF only
    //             forwardedValues: {
    //               queryString: true,
    //               cookies: {
    //                 forward: "all",
    //               },
    //             },
    //           },
    //         ],
    //       },
    //     ],
    //     // Custom domain stuff
    //     viewerCertificate: cf.ViewerCertificate.fromAcmCertificate(apiCert, {
    //       aliases: [API_DOMAIN],
    //       securityPolicy: cf.SecurityPolicyProtocol.TLS_V1_2_2018,
    //     }),
    //     webACLId: API_WAF.attrArn,
    //   }
    // );

    // Creates an A record that points our API domain to Cloudfront
    // new ARecord(this, `APIAlias`, {
    //   zone: hostedZone,
    //   recordName: "api",
    //   target: RecordTarget.fromAlias(new CloudFrontTarget(distribution)),
    // });
  }
}
