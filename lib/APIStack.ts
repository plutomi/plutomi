import * as cdk from "@aws-cdk/core";
import * as apigw from "@aws-cdk/aws-apigatewayv2";
import * as acm from "@aws-cdk/aws-certificatemanager";
import * as route53 from "@aws-cdk/aws-route53";
import * as targets from "@aws-cdk/aws-route53-targets";

/**
 * Creates an API Gateway
 */
export default class APIStack extends cdk.Stack {
  public api: apigw.HttpApi;
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const API_SUBDOMAIN = process.env.NODE_ENV === "production" ? "api" : "dev";

    // Retrieves the hosted zone from Route53
    const hostedZone = route53.HostedZone.fromHostedZoneAttributes(
      this,
      `HostedZone`,
      {
        hostedZoneId: process.env.HOSTED_ZONE_ID,
        zoneName: process.env.DOMAIN_NAME,
      }
    );

    // Retrieves the certificate that we are using for our domain
    const apiCert = acm.Certificate.fromCertificateArn(
      this,
      `CertificateArn`,
      `arn:aws:acm:${cdk.Stack.of(this).region}:${
        cdk.Stack.of(this).account
      }:certificate/${process.env.ACM_CERTIFICATE_ID}`
    );

    // Creates a domain for our API
    const domain = new apigw.DomainName(this, `APIDomain`, {
      
      domainName: API_SUBDOMAIN + "." + process.env.DOMAIN_NAME,
      certificate: apiCert,
    });

    // Defines an http API Gateway
    let api = new apigw.HttpApi(this, `APIEndpoint`, {
      defaultDomainMapping: {
        domainName: domain,
      },
    });

    // Creates an A record to point to our API
    new route53.ARecord(this, `APIAlias`, {
      zone: hostedZone,
      recordName: API_SUBDOMAIN,
      target: route53.RecordTarget.fromAlias(
        new targets.ApiGatewayv2DomainProperties(
          domain.regionalDomainName,
          domain.regionalHostedZoneId
        )
      ),
    });

    // Prints the endpoint to the console
    new cdk.CfnOutput(this, "API URL", {
      value: api.apiEndpoint ?? "Something went wrong with the deploy",
    });
  }
}
