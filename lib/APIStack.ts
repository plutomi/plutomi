import * as dotenv from "dotenv";
import * as cdk from "@aws-cdk/core";
import * as cf from "@aws-cdk/aws-cloudfront";
import * as waf from "@aws-cdk/aws-wafv2";
import * as logs from "@aws-cdk/aws-logs";
import { HttpApi, CorsHttpMethod } from "@aws-cdk/aws-apigatewayv2";
import { Certificate } from "@aws-cdk/aws-certificatemanager";
import { HostedZone, ARecord, RecordTarget } from "@aws-cdk/aws-route53";
import { CloudFrontTarget } from "@aws-cdk/aws-route53-targets";
import * as cr from "@aws-cdk/custom-resources";
import { API_DOMAIN, API_SUBDOMAIN, DOMAIN_NAME, WEBSITE_URL } from "../Config";
const resultDotEnv = dotenv.config({
  path: `${process.cwd()}/.env.${process.env.NODE_ENV}`,
});

if (resultDotEnv.error) {
  throw resultDotEnv.error;
}

interface APIGatewayServiceProps extends cdk.StackProps {}

/**
 * Creates an API Gateway
 */
export default class APIStack extends cdk.Stack {
  public api: HttpApi;
  constructor(
    scope: cdk.Construct,
    id: string,
    props?: APIGatewayServiceProps
  ) {
    super(scope, id, props);

    // Retrieves the hosted zone from Route53
    const hostedZone = HostedZone.fromHostedZoneAttributes(this, `HostedZone`, {
      hostedZoneId: process.env.HOSTED_ZONE_ID,
      zoneName: DOMAIN_NAME,
    });

    // Retrieves the certificate that we are using for our domain
    const apiCert = Certificate.fromCertificateArn(
      this,
      `CertificateArn`,
      `arn:aws:acm:${this.region}:${this.account}:certificate/${process.env.ACM_CERTIFICATE_ID}`
    );

    // Defines an HTTP API Gateway
    this.api = new HttpApi(this, `${process.env.NODE_ENV}-APIEndpoint`, {
      corsPreflight: {
        allowMethods: [
          CorsHttpMethod.OPTIONS,
          CorsHttpMethod.GET,
          CorsHttpMethod.POST,
          CorsHttpMethod.PUT,
          CorsHttpMethod.PATCH,
          CorsHttpMethod.DELETE,
        ],
        allowCredentials: true,
        allowOrigins: [WEBSITE_URL], // TODO cloudfront directl
        allowHeaders: ["Content-Type"],
      },
    });

    // Create the WAF & WAF Rules
    const API_WAF = new waf.CfnWebACL(
      this,
      `${process.env.NODE_ENV}-API-Gateway-WAF`,
      {
        name: `${process.env.NODE_ENV}-API-Gateway-WAF`,

        description:
          "This WAF blocks IPs that are making too many requests and sends the logs of those blocks to cloudwatch.",
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
            name: `too-many-requests-rule`,
            priority: 0,
            statement: {
              rateBasedStatement: {
                limit: 1000, // In a 5 minute period
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
              metricName: `${process.env.NODE_ENV}-WAF-BLOCKED-IPs`,
            },
          },
          {
            name: "AWS-AWSManagedRulesBotControlRuleSet",
            priority: 1,
            statement: {
              managedRuleGroupStatement: {
                vendorName: "AWS",
                name: "AWSManagedRulesBotControlRuleSet",
              },
            },
            overrideAction: {
              none: {},
            },
            visibilityConfig: {
              sampledRequestsEnabled: false,
              cloudWatchMetricsEnabled: true,
              metricName: "AWS-AWSManagedRulesBotControlRuleSet",
            },
          },
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
          {
            name: "AWS-AWSManagedRulesCommonRuleSet",
            priority: 3,
            statement: {
              managedRuleGroupStatement: {
                vendorName: "AWS",
                name: "AWSManagedRulesCommonRuleSet",
              },
            },
            overrideAction: {
              none: {},
            },
            visibilityConfig: {
              sampledRequestsEnabled: false,
              cloudWatchMetricsEnabled: true,
              metricName: "AWS-AWSManagedRulesCommonRuleSet",
            },
          },
        ],
      }
    );

    // Creates a Cloudfront distribution so that we can attach a WAF to it.
    // API GatewayV2 does not allow WAF directly at the moment :/
    // TODO also. Cannot send logs directly to Cloudwatch from CDK / CF. :T
    const distribution = new cf.CloudFrontWebDistribution(
      this,
      `${process.env.NODE_ENV}-CF-API-Distribution`,
      {
        httpVersion: cf.HttpVersion.HTTP2,
        priceClass: cf.PriceClass.PRICE_CLASS_ALL,
        viewerProtocolPolicy: cf.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,

        originConfigs: [
          {
            customOriginSource: {
              /**
               * this.api.url & this.api.apiEndpoint were not working:
               * Invalid request provided: The parameter origin name cannot contain a colon.
               * https://stackoverflow.com/a/57467656
               */
              domainName: `${this.api.httpApiId}.execute-api.${this.region}.amazonaws.com`,
            },
            behaviors: [
              {
                isDefaultBehavior: true,
                allowedMethods: cf.CloudFrontAllowedMethods.ALL, // TODO cache /public routes
                defaultTtl: cdk.Duration.seconds(0), // NO CACHING!! CF is for WAF only
                minTtl: cdk.Duration.seconds(0), // NO CACHING!! CF is for WAF only
                maxTtl: cdk.Duration.seconds(0), // NO CACHING!! CF is for WAF only
                forwardedValues: {
                  queryString: true,
                  cookies: {
                    forward: "all",
                  },
                },
              },
            ],
          },
        ],
        // Custom domain stuff
        viewerCertificate: cf.ViewerCertificate.fromAcmCertificate(apiCert, {
          aliases: [API_DOMAIN],
          securityPolicy: cf.SecurityPolicyProtocol.TLS_V1_2_2018,
        }),
        webACLId: API_WAF.attrArn,
      }
    );

    // TODO BUG this gets stuck on CREATE_IN_PROGRESS - I think its because of the process.env prefix
    // Creates an A record that points our API domain to Cloudfront
    new ARecord(this, `APIAlias`, {
      zone: hostedZone,
      recordName: API_SUBDOMAIN,
      target: RecordTarget.fromAlias(new CloudFrontTarget(distribution)),
    });
  }
}
