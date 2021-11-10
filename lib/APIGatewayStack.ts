import { CorsHttpMethod, HttpApi } from "@aws-cdk/aws-apigatewayv2";
import * as cdk from "@aws-cdk/core";
import { DomainName } from "@aws-cdk/aws-apigatewayv2";
import * as acm from "@aws-cdk/aws-certificatemanager";
import { HostedZone, CnameRecord } from "@aws-cdk/aws-route53";
import * as ssm from "@aws-cdk/aws-ssm";
import * as route53 from "@aws-cdk/aws-route53";
export class APIGatewayStack extends cdk.Stack {
  // Make the API accessible to other stacks so we can add routes
  public API: HttpApi;

  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const CERTIFICATE_ARN = ssm.StringParameter.fromStringParameterAttributes(
      this,
      "plutomi-domain-certificate-arn",
      {
        parameterName: "/plutomi/CERTIFICATE_ARN",
      }
    ).stringValue;

    const HOSTED_ZONE_ID = ssm.StringParameter.fromStringParameterAttributes(
      this,
      "plutomi-hosted-zone-id",
      {
        parameterName: "/plutomi/HOSTED_ZONE_ID",
      }
    ).stringValue;

    const DOMAIN_NAME = ssm.StringParameter.fromStringParameterAttributes(
      this,
      "plutomi-domain-name",
      {
        parameterName: "/plutomi/DOMAIN_NAME",
      }
    ).stringValue;

    const domain = new DomainName(this, "DN", {
      domainName: `api.${DOMAIN_NAME}`,
      certificate: acm.Certificate.fromCertificateArn(
        this,
        "DomainCertificate",
        CERTIFICATE_ARN
      ),
    });

    // Get a reference to AN EXISTING hosted zone
    const hostedZone = HostedZone.fromHostedZoneAttributes(this, "HostedZone", {
      hostedZoneId: HOSTED_ZONE_ID,
      zoneName: DOMAIN_NAME,
    });

    // Finally, add a CName record in the hosted zone with a value of the new custom domain that was created
    new CnameRecord(this, "ApiGatewayRecordSet", {
      zone: hostedZone,
      recordName: "api",
      domainName: domain.regionalDomainName,
    });

    // Create the API
    const apigw = new HttpApi(this, "plutomi-api", {
      description: `Main API for the ${DOMAIN_NAME} website`,
      createDefaultStage: true,
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

    // Output url to the console
    new cdk.CfnOutput(this, "API_URL", {
      value: apigw.apiEndpoint,
      description: "The url of the API",
      exportName: "APIURL",
    });
  }
}
