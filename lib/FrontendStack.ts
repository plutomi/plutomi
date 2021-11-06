import { NextJSLambdaEdge } from "@sls-next/cdk-construct";
import * as cdk from "@aws-cdk/core";
import * as ssm from "@aws-cdk/aws-ssm";
import * as route53 from "@aws-cdk/aws-route53";
import * as acm from "@aws-cdk/aws-certificatemanager";

export class FrontendStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const DOMAIN_NAME = ssm.StringParameter.fromStringParameterAttributes(
      this,
      "plutomi-domain-name",
      {
        parameterName: "/plutomi/DOMAIN_NAME",
      }
    ).stringValue;

    const HOSTED_ZONE_ID = ssm.StringParameter.fromStringParameterAttributes(
      this,
      "plutomi-domain-hosted-zone-id",
      {
        parameterName: "/plutomi/HOSTED_ZONE_ID",
      }
    ).stringValue;

    const CERTIFICATE_ARN = ssm.StringParameter.fromStringParameterAttributes(
      this,
      "plutomi-domain-certificate",
      {
        parameterName: "/plutomi/CERTIFICATE_ARN",
      }
    ).stringValue;

    new NextJSLambdaEdge(this, "PlutomiFrontendStack", {
      serverlessBuildOutDir: "./build",
      stackName: "plutomi-frontend-stack",
      withLogging: true,
      domain: {
        domainNames: [DOMAIN_NAME],
        hostedZone: route53.HostedZone.fromHostedZoneAttributes(
          this,
          "plutomi-hosted-zone",
          {
            hostedZoneId: HOSTED_ZONE_ID,
            zoneName: DOMAIN_NAME,
          }
        ),
        certificate: acm.Certificate.fromCertificateArn(
          this,
          "plutomi-certificate",
          CERTIFICATE_ARN
        ),
      },
      name: {
        defaultLambda: "plutomi-default-lambda",
        imageLambda: "plutomi-image-lambda",
        apiLambda: "plutomi-api-lambda",
      },
      memory: {
        defaultLambda: 256,
        imageLambda: 1024,
        apiLambda: 256,
      },
      // TODO add api route
    });
  }
}
