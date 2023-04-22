import type { Stack } from "aws-cdk-lib";
import type { ApplicationLoadBalancedFargateService } from "aws-cdk-lib/aws-ecs-patterns";
import { WafwebaclToAlb } from "@aws-solutions-constructs/aws-wafwebacl-alb";
import { env } from "../env";

type CreateWafProps = {
  stack: Stack;
  fargateService: ApplicationLoadBalancedFargateService;
};

export const createWaf = ({
  stack,
  fargateService
}: CreateWafProps): WafwebaclToAlb => {
  const deploymentEnvironment = env.DEPLOYMENT_ENVIRONMENT;

  const waf = new WafwebaclToAlb(
    stack,
    `${deploymentEnvironment}-plutomi-waf`,
    {
      // ! TODO: Update diagram to include WAF at ALB
      existingLoadBalancerObj: fargateService.loadBalancer,
      webaclProps: {
        defaultAction: {
          allow: {}
        },

        scope: "REGIONAL",
        visibilityConfig: {
          cloudWatchMetricsEnabled: true,
          metricName: "cloudfront-no-header-waf",
          sampledRequestsEnabled: true
        },
        rules: [
          {
            name: "BlockIfNoHeader",
            priority: 0,
            statement: {
              byteMatchStatement: {
                fieldToMatch: {
                  singleHeader: {
                    name: env.CF_HEADER_KEY
                  }
                },
                positionalConstraint: "EXACTLY",
                textTransformations: [],
                searchString: env.CF_HEADER_VALUE
              }
            },
            action: {
              block: {
                customResponse: {
                  responseCode: 401
                }
              }
            },
            visibilityConfig: {
              sampledRequestsEnabled: true,
              cloudWatchMetricsEnabled: true,
              metricName: `${deploymentEnvironment}-WAF-API-BLOCKED-IPs`
            }
          },

          {
            name: "too-many-api-requests-rule",
            priority: 1,
            statement: {
              rateBasedStatement: {
                limit: 200, // In a 5 minute period
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
                    searchString: "/api"
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
              metricName: `${deploymentEnvironment}-WAF-API-BLOCKED-IPs`
            }
          },

          {
            name: "too-many-graphql-requests-rule",
            // Note: This was blocking postman at one point
            priority: 2,
            statement: {
              managedRuleGroupStatement: {
                vendorName: "AWS",
                name: "AWSManagedRulesBotControlRuleSet"
              }
            },
            overrideAction: {
              none: {}
            },
            visibilityConfig: {
              sampledRequestsEnabled: false,
              cloudWatchMetricsEnabled: true,
              metricName: "AWS-AWSManagedRulesBotControlRuleSet"
            }
          },

          {
            name: "AWS-AWSManagedRulesAmazonIpReputationList",
            priority: 3,
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
          },
          {
            // TODO this rule breaks login links, see https://github.com/plutomi/plutomi/issues/510
            name: "AWS-AWSManagedRulesCommonRuleSet",
            priority: 4,
            statement: {
              managedRuleGroupStatement: {
                vendorName: "AWS",
                name: "AWSManagedRulesCommonRuleSet"
              }
            },
            overrideAction: {
              none: {}
            },
            visibilityConfig: {
              sampledRequestsEnabled: false,
              cloudWatchMetricsEnabled: true,
              metricName: "AWS-AWSManagedRulesCommonRuleSet"
            }
          }
        ]
      }
    }
  );

  return waf;
};
