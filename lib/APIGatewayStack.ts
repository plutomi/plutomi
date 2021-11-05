import { CorsHttpMethod, HttpApi } from "@aws-cdk/aws-apigatewayv2";
import * as cdk from "@aws-cdk/core";
import { DomainName } from "@aws-cdk/aws-apigatewayv2";
import * as acm from "@aws-cdk/aws-certificatemanager";
import { HostedZone, CnameRecord } from "@aws-cdk/aws-route53";

export class APIGatewayStack extends cdk.Stack {
  // Make the API accessible to other stacks so we can add routes
  public API: HttpApi;

  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // const domain = new DomainName(this, "DN", {
    //   domainName: process.env.API_URL as string,
    //   certificate: acm.Certificate.fromCertificateArn(
    //     this,
    //     "DomainCertificate",
    //     process.env.DOMAIN_CERTIFICATE_ARN as string
    //   ),
    // });

    // Get a reference to AN EXISTING hosted zone
    // const hostedZone = HostedZone.fromHostedZoneAttributes(this, "HostedZone", {
    //   hostedZoneId: process.env.HOSTED_ZONE_ID as string,
    //   zoneName: process.env.HOSTED_ZONE_NAME as string,
    // });

    // Finally, add a CName record in the hosted zone with a value of the new custom domain that was created
    // new CnameRecord(this, "ApiGatewayRecordSet", {
    //   zone: hostedZone,
    //   recordName: "api",
    //   domainName: domain.regionalDomainName,
    // });

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
      // defaultDomainMapping: {
      //   domainName: domain,
      // },
    });

    // Export the API so we can reference it in other stacks
    this.API = apigw;

    // Output url to the console
    new cdk.CfnOutput(this, "API_URL", {
      value: apigw.apiEndpoint,
      description: "The url of the API",
      exportName: "APIURL",
    });
  }
}
