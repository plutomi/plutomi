import * as dotenv from "dotenv";
import * as cdk from "@aws-cdk/core";
import * as cf from "@aws-cdk/aws-cloudfront";
import { LambdaProxyIntegration } from "@aws-cdk/aws-apigatewayv2-integrations";
import {
  HttpApi,
  DomainName,
  CorsHttpMethod,
  HttpMethod,
} from "@aws-cdk/aws-apigatewayv2";
import { Certificate } from "@aws-cdk/aws-certificatemanager";
import { HostedZone, ARecord, RecordTarget } from "@aws-cdk/aws-route53";
import {
  ApiGatewayv2DomainProperties,
  CloudFrontTarget,
} from "@aws-cdk/aws-route53-targets";
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
      `arn:aws:acm:${cdk.Stack.of(this).region}:${
        cdk.Stack.of(this).account
      }:certificate/${process.env.ACM_CERTIFICATE_ID}`
    );

    // Defines an http API Gateway
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

    // Creates a cloudfront distribution so that we can attach a WAF to it.
    // API GatewayV2 does not allow WAF directly at the moment
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
        viewerCertificate: cf.ViewerCertificate.fromAcmCertificate(apiCert, {
          aliases: [API_DOMAIN],
          securityPolicy: cf.SecurityPolicyProtocol.TLS_V1_2_2018,
        }),
      }
    );

    // Creates an A record to point to our API behind cloudfront
    new ARecord(this, `${process.env.NODE_ENV}-APIAlias`, {
      zone: hostedZone,
      recordName: API_SUBDOMAIN,
      target: RecordTarget.fromAlias(new CloudFrontTarget(distribution)),
    });
  }
}
