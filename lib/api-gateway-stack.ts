import { CorsHttpMethod, HttpApi } from "@aws-cdk/aws-apigatewayv2";
import * as cdk from "@aws-cdk/core";
import { DomainName } from "@aws-cdk/aws-apigatewayv2";
import * as acm from "@aws-cdk/aws-certificatemanager";
import { HostedZone, CnameRecord } from "@aws-cdk/aws-route53";

export class ApiGatewayStack extends cdk.Stack {
  // Make the API accessible to other stacks so we can add routes
  public API: HttpApi;

  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    /**
     * We need to create an API & a custom domain for it so it doesn't change on each redeploy
     *
     * Parts from: https://stackoverflow.com/a/61573642
     * and https://docs.aws.amazon.com/cdk/api/latest/docs/@aws-cdk_aws-apigatewayv2.DomainName.html
     *
     */

    console.log(
      "Certificate ARN BLAH BLAH BLAH BLAH BLAH BLAH BLAH BLAH BLAH BLAH BLAH BLAH ",
      process.env.DOMAIN_CERTIFICATE_ARN as string
    );
    const domain = new DomainName(this, "DN", {
      domainName: process.env.API_URL as string,
      certificate: acm.Certificate.fromCertificateArn(
        this,
        "DomainCertificate",
        process.env.DOMAIN_CERTIFICATE_ARN as string
      ),
    });

    // Get a reference to AN EXISTING hosted zone
    const hostedZone = HostedZone.fromHostedZoneAttributes(this, "HostedZone", {
      hostedZoneId: process.env.HOSTED_ZONE_ID as string,
      zoneName: process.env.HOSTED_ZONE_NAME as string,
    });

    // Finally, add a CName record in the hosted zone with a value of the new custom domain that was created
    new CnameRecord(this, "ApiGatewayRecordSet", {
      zone: hostedZone,
      recordName: "api",
      domainName: domain.regionalDomainName,
    });

    // Create the API
    const apigw = new HttpApi(this, "plutomi-api", {
      description: `Main API for the ${
        process.env.HOSTED_ZONE_NAME as string
      } website`,
      corsPreflight: {
        allowHeaders: [
          "Content-Type",
          "X-Amz-Date",
          "Authorization",
          "X-Api-Key",
        ],
        allowMethods: [
          CorsHttpMethod.OPTIONS,
          CorsHttpMethod.GET,
          CorsHttpMethod.POST,
          CorsHttpMethod.PUT,
          CorsHttpMethod.PATCH,
          CorsHttpMethod.DELETE,
        ],
      },
      defaultDomainMapping: {
        domainName: domain,
      },
    });

    // Export the API so we can reference it in other stacks
    this.API = apigw;
  }
}
