import { CfnWebACL } from "aws-cdk-lib/aws-waf";
import type { Stack } from "aws-cdk-lib";
import { allEnvVariables } from "../env";

type CreateWafProps = {
  stack: Stack;
};

export const createWaf = ({ stack }: CreateWafProps): CfnWebACL => {
  const deploymentEnvironment = allEnvVariables.DEPLOYMENT_ENVIRONMENT;
  const waf = new CfnWebACL(stack, `${deploymentEnvironment}-API-WAF`, {
    name: `${deploymentEnvironment}-API-WAF`,
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
        name: "too-many-api-requests-rule",
        priority: 0,
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
        name: "oo-many-web-requests-rule",
        priority: 1,
        statement: {
          rateBasedStatement: {
            limit: 200, // In a 5 minute period
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
          metricName: `${deploymentEnvironment}-WAF-GENERAL-BLOCKED-IPs`
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
  });

  return waf;
};
