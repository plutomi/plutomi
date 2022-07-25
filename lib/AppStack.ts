import * as cf from 'aws-cdk-lib/aws-cloudfront';
import * as ecsPatterns from 'aws-cdk-lib/aws-ecs-patterns';
import * as cdk from 'aws-cdk-lib';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as protocol from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import { Certificate } from 'aws-cdk-lib/aws-certificatemanager';
import { ARecord, RecordTarget } from 'aws-cdk-lib/aws-route53';
import { CloudFrontTarget } from 'aws-cdk-lib/aws-route53-targets';
import { Policy, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { DOMAIN_NAME, EXPRESS_PORT } from '../Config';
import * as waf from 'aws-cdk-lib/aws-wafv2';

interface AppStackServiceProps extends cdk.StackProps {
  table: Table;
}

export default class AppStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: AppStackServiceProps) {
    super(scope, id, props);

    const { HOSTED_ZONE_ID } = process.env;

    // IAM inline role - the service principal is required
    const taskRole = new iam.Role(this, 'plutomi-api-fargate-role', {
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
    });

    // Allows Fargate to access DynamoDB
    const dynamoAccessPolicyStatement = new PolicyStatement({
      actions: [
        'dynamodb:GetItem',
        'dynamodb:DeleteItem',
        'dynamodb:PutItem',
        'dynamodb:Query',
        'dynamodb:UpdateItem',
      ],
      resources: [
        props.table.tableArn,
        `${props.table.tableArn}/index/GSI1`,
        `${props.table.tableArn}/index/GSI2`,
      ],
    });

    // Allows fargate to send emails
    const sesSendEmailPolicy = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ['ses:SendEmail', 'ses:SendRawEmail', 'ses:SendTemplatedEmail'],
      resources: [
        `arn:aws:ses:${this.region}:${cdk.Stack.of(this).account}:identity/${DOMAIN_NAME}`,
      ],
    });

    const policy = new Policy(this, `${process.env.NODE_ENV}-plutomi-api-policy`, {
      statements: [dynamoAccessPolicyStatement, sesSendEmailPolicy],
    });
    taskRole.attachInlinePolicy(policy);
    // Define a fargate task with the newly created execution and task roles
    const taskDefinition = new ecs.FargateTaskDefinition(
      this,
      'plutomi-api-fargate-task-definition',
      {
        taskRole,
        executionRole: taskRole,
        cpu: 256,
        memoryLimitMiB: 512,
      },
    );

    const container = taskDefinition.addContainer('plutomi-api-fargate-container', {
      // Get the local docker image, build and deploy it
      image: ecs.ContainerImage.fromAsset('.'),
      logging: new ecs.AwsLogDriver({
        streamPrefix: 'plutomi-api-fargate',
      }),
    });

    // API
    container.addPortMappings({
      containerPort: EXPRESS_PORT || 3000,
      protocol: ecs.Protocol.TCP,
    });

    // Create a VPC
    const vpc = new ec2.Vpc(this, 'plutomi-api-fargate-vpc', {
      maxAzs: 3,
      natGateways: 0, // Very pricy! https://www.lastweekinaws.com/blog/the-aws-managed-nat-gateway-is-unpleasant-and-not-recommended/
    });

    // Create the cluster
    const cluster = new ecs.Cluster(this, 'plutomi-api-fargate-cluster', {
      vpc,
      containerInsights: true,
    });

    // Get a reference to AN EXISTING hosted zone
    const hostedZone = route53.HostedZone.fromHostedZoneAttributes(this, 'plutomi-hosted-zone', {
      hostedZoneId: HOSTED_ZONE_ID,
      zoneName: DOMAIN_NAME,
    });

    // Retrieves the certificate that we are using for our domain
    const apiCert = Certificate.fromCertificateArn(
      this,
      `CertificateArn`,
      `arn:aws:acm:${this.region}:${this.account}:certificate/${process.env.ACM_CERTIFICATE_ID}`,
    );

    // Create a load-balanced Fargate service and make it public with HTTPS traffic only
    const loadBalancedFargateService = new ecsPatterns.ApplicationLoadBalancedFargateService(
      this,
      'PlutomiApi',
      {
        cluster, // Required
        certificate: apiCert,
        taskDefinition,
        desiredCount: 3,
        listenerPort: 443,
        protocol: protocol.ApplicationProtocol.HTTPS,
        redirectHTTP: true,
        assignPublicIp: true, // TODO revisit this
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
      'deregistration_delay.timeout_seconds',
      '30',
    );
    // Healthcheck thresholds
    loadBalancedFargateService.targetGroup.configureHealthCheck({
      interval: cdk.Duration.seconds(5),
      healthyThresholdCount: 2,
      unhealthyThresholdCount: 2,
      timeout: cdk.Duration.seconds(4),
    });

    // Auto scaling
    const scalableTarget = loadBalancedFargateService.service.autoScaleTaskCount({
      minCapacity: 3,
      maxCapacity: 5,
    });

    /**
     * Good reading on fargate 25% time :>
     * https://github.com/aws/containers-roadmap/issues/163
     */
    scalableTarget.scaleOnCpuUtilization('CpuScaling', {
      targetUtilizationPercent: 15,
    });

    // Create the WAF & its rules
    const API_WAF = new waf.CfnWebACL(this, `${process.env.NODE_ENV}-API-WAF`, {
      name: `${process.env.NODE_ENV}-API-WAF`,
      description: 'Blocks IPs that make too many requests',
      defaultAction: {
        allow: {},
      },
      scope: 'CLOUDFRONT',
      visibilityConfig: {
        cloudWatchMetricsEnabled: true,
        metricName: 'cloudfront-ipset-waf',
        sampledRequestsEnabled: true,
      },
      rules: [
        {
          name: `too-many-api-requests-rule`,
          priority: 0,
          statement: {
            rateBasedStatement: {
              limit: 1000, // In a 5 minute period
              aggregateKeyType: 'IP',
              scopeDownStatement: {
                byteMatchStatement: {
                  fieldToMatch: {
                    uriPath: {},
                  },
                  positionalConstraint: 'CONTAINS',
                  textTransformations: [
                    {
                      priority: 0,
                      type: 'LOWERCASE',
                    },
                  ],
                  searchString: '/api/',
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
            metricName: `${process.env.NODE_ENV}-WAF-API-BLOCKED-IPs`,
          },
        },
        {
          name: `too-many-web-requests-rule`,
          priority: 1,
          statement: {
            rateBasedStatement: {
              limit: 2000, // In a 5 minute period
              aggregateKeyType: 'IP',
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
            metricName: `${process.env.NODE_ENV}-WAF-GENERAL-BLOCKED-IPs`,
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
          name: 'AWS-AWSManagedRulesAmazonIpReputationList',
          priority: 2,
          statement: {
            managedRuleGroupStatement: {
              vendorName: 'AWS',
              name: 'AWSManagedRulesAmazonIpReputationList',
            },
          },
          overrideAction: {
            none: {},
          },
          visibilityConfig: {
            sampledRequestsEnabled: false,
            cloudWatchMetricsEnabled: true,
            metricName: 'AWS-AWSManagedRulesAmazonIpReputationList',
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
    });

    // No caching! We're using Cloudfront for its global network and WAF
    const cachePolicy = new cf.CachePolicy(this, `${process.env.NODE_ENV}-Cache-Policy`, {
      defaultTtl: cdk.Duration.seconds(0),
      minTtl: cdk.Duration.seconds(0),
      maxTtl: cdk.Duration.seconds(0),
    });

    const distribution = new cf.Distribution(this, `${process.env.NODE_ENV}-CF-API-Distribution`, {
      certificate: apiCert,
      webAclId: API_WAF.attrArn,
      domainNames: [DOMAIN_NAME],
      defaultBehavior: {
        origin: new origins.LoadBalancerV2Origin(loadBalancedFargateService.loadBalancer),

        // Must be enabled!
        // https://www.reddit.com/r/aws/comments/rhckdm/comment/hoqrjmm/?utm_source=share&utm_medium=web2x&context=3
        originRequestPolicy: cf.OriginRequestPolicy.ALL_VIEWER,
        cachePolicy,
        allowedMethods: cf.AllowedMethods.ALLOW_ALL,
      },
      // additionalBehaviors: {
      // TODO add /public caching behaviors here
      // },
    });

    //  Creates an A record that points our API domain to Cloudfront
    new ARecord(this, `APIAlias`, {
      zone: hostedZone,
      target: RecordTarget.fromAlias(new CloudFrontTarget(distribution)),
    });
  }
}
