import { type StackProps, Stack } from "aws-cdk-lib";
import type { Construct } from "constructs";
import * as cf from "aws-cdk-lib/aws-cloudfront";
import { Duration } from "aws-cdk-lib";
import * as origins from "aws-cdk-lib/aws-cloudfront-origins";
import { ARecord, RecordTarget } from "aws-cdk-lib/aws-route53";
import { CloudFrontTarget } from "aws-cdk-lib/aws-route53-targets";
import * as waf from "aws-cdk-lib/aws-wafv2";
import {
  createTaskRole,
  createTaskDefinition,
  createVpc,
  createCluster,
  createFargateService,
  getHostedZone
} from "../utils";
import { getACMCertificate } from "../utils/getACMCertificate";
import { addContainerToTaskDefinition } from "../utils/addContainerToTaskDefinition";
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
    const container = addContainerToTaskDefinition({
      taskDefinition
    });

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

    // Create the WAF & its rules
    // TODO move this out
    const API_WAF = new waf.CfnWebACL(
      this,
      `${envVars.NEXT_PUBLIC_DEPLOYMENT_ENVIRONMENT}-API-WAF`,
      {
        name: `${envVars.NEXT_PUBLIC_DEPLOYMENT_ENVIRONMENT}-API-WAF`,
        description: "Blocks IPs that make too many requests",
        defaultAction: {
          allow: {}
        },
        scope: "CLOUDFRONT",
        visibilityConfig: {
          cloudWatchMetricsEnabled: true,
          metricName: "cloudfront-ipset-waf",
          sampledRequestsEnabled: true
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
                      uriPath: {}
                    },
                    positionalConstraint: "CONTAINS",
                    textTransformations: [
                      {
                        priority: 0,
                        type: "LOWERCASE"
                      }
                    ],
                    searchString: "/api/"
                  }
                }
              }
            },
            action: {
              block: {
                customResponse: {
                  responseCode: 429
                }
              }
            },
            visibilityConfig: {
              sampledRequestsEnabled: true,
              cloudWatchMetricsEnabled: true,
              metricName: `${envVars.NEXT_PUBLIC_DEPLOYMENT_ENVIRONMENT}-WAF-API-BLOCKED-IPs`
            }
          },
          {
            name: `too-many-web-requests-rule`,
            priority: 1,
            statement: {
              rateBasedStatement: {
                limit: Servers.rateLimit.web, // In a 5 minute period
                aggregateKeyType: "IP"
              }
            },
            action: {
              block: {
                customResponse: {
                  responseCode: 429
                }
              }
            },
            visibilityConfig: {
              sampledRequestsEnabled: true,
              cloudWatchMetricsEnabled: true,
              metricName: `${envVars.NEXT_PUBLIC_DEPLOYMENT_ENVIRONMENT}-WAF-GENERAL-BLOCKED-IPs`
            }
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
                name: "AWSManagedRulesAmazonIpReputationList"
              }
            },
            overrideAction: {
              none: {}
            },
            visibilityConfig: {
              sampledRequestsEnabled: false,
              cloudWatchMetricsEnabled: true,
              metricName: "AWS-AWSManagedRulesAmazonIpReputationList"
            }
          }
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
        ]
      }
    );

    // No caching! We're using Cloudfront for its global network and WAF
    const cachePolicy = new cf.CachePolicy(
      this,
      `${allEnvVariables.DEPLOYMENT_ENVIRONMENT}-Cache-Policy`,
      {
        defaultTtl: Duration.seconds(0),
        minTtl: Duration.seconds(0),
        maxTtl: Duration.seconds(0)
      }
    );

    const distribution = new cf.Distribution(
      this,
      `${allEnvVariables.DEPLOYMENT_ENVIRONMENT}-CF-API-Distribution`,
      {
        certificate,
        webAclId: API_WAF.attrArn,
        domainNames: [allEnvVariables.DOMAIN],
        defaultBehavior: {
          origin: new origins.LoadBalancerV2Origin(fargateService.loadBalancer),

          // Must be enabled!
          // https://www.reddit.com/r/aws/comments/rhckdm/comment/hoqrjmm/?utm_source=share&utm_medium=web2x&context=3
          originRequestPolicy: cf.OriginRequestPolicy.ALL_VIEWER,
          cachePolicy,
          allowedMethods: cf.AllowedMethods.ALLOW_ALL
        }
        // additionalBehaviors: {
        // TODO add /public caching behaviors here
        // }, //
      }
    );

    //  Creates an A record that points our API domain to Cloudfront
    new ARecord(this, `APIAlias`, {
      recordName:
        envVars.NEXT_PUBLIC_DEPLOYMENT_ENVIRONMENT === "stage"
          ? STAGE_DOMAIN_NAME
          : DOMAIN_NAME,
      zone: hostedZone,
      target: RecordTarget.fromAlias(new CloudFrontTarget(distribution))
    });
  }
}
