import * as dotenv from "dotenv";
import * as cdk from "@aws-cdk/core";
import { HttpApi, DomainName } from "@aws-cdk/aws-apigatewayv2";
import { Certificate } from "@aws-cdk/aws-certificatemanager";
import { HostedZone, ARecord, RecordTarget } from "@aws-cdk/aws-route53";
import { ApiGatewayv2DomainProperties } from "@aws-cdk/aws-route53-targets";

const resultDotEnv = dotenv.config({
  path: __dirname + `../../.env.${process.env.NODE_ENV}`,
});

if (resultDotEnv.error) {
  throw resultDotEnv.error;
}

/**
 * Creates an API Gateway
 */
export default class APIStack extends cdk.Stack {
  public api: HttpApi;
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const API_SUBDOMAIN = process.env.NODE_ENV === "production" ? "api" : "dev";

    // Retrieves the hosted zone from Route53
    const hostedZone = HostedZone.fromHostedZoneAttributes(this, `HostedZone`, {
      hostedZoneId: process.env.HOSTED_ZONE_ID,
      zoneName: process.env.DOMAIN_NAME,
    });

    // Retrieves the certificate that we are using for our domain
    const apiCert = Certificate.fromCertificateArn(
      this,
      `CertificateArn`,
      `arn:aws:acm:${cdk.Stack.of(this).region}:${
        cdk.Stack.of(this).account
      }:certificate/${process.env.ACM_CERTIFICATE_ID}`
    );

    // Creates a domain for our API
    const domain = new DomainName(this, `APIDomain`, {
      domainName: `${API_SUBDOMAIN}.${process.env.DOMAIN_NAME}`,
      certificate: apiCert,
    });

    // Defines an http API Gateway
    this.api = new HttpApi(this, `${process.env.NODE_ENV}-APIEndpoint`, {
      defaultDomainMapping: {
        domainName: domain,
      },
    });

    // Creates an A record to point to our API
    new ARecord(this, `APIAlias`, {
      zone: hostedZone,
      recordName: API_SUBDOMAIN,
      target: RecordTarget.fromAlias(
        new ApiGatewayv2DomainProperties(
          domain.regionalDomainName,
          domain.regionalHostedZoneId
        )
      ),
    });

    // Prints the endpoint to the console
    new cdk.CfnOutput(this, "API URL", {
      value: this.api.apiEndpoint ?? "Something went wrong with the deploy",
    });
  }
}
