// stack.ts
import { NextJSLambdaEdge } from "@sls-next/cdk-construct";
import * as cdk from "@aws-cdk/core";
import { HostedZone } from "@aws-cdk/aws-route53";
import { Certificate } from "@aws-cdk/aws-certificatemanager";

/**
 * Deploys the Nextjs app to cloudfront with a custom domain
 */
export default class FrontendStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    new NextJSLambdaEdge(this, "NextJsApp", {
      serverlessBuildOutDir: "./build",

      // `HostedZone.fromHostedZoneAttributes` & `Certificate.fromCertificateArn`
      // retrieve existing resources, however you could create a new ones in your
      // stack via the relevant constructs
      domain: {
        domainNames: ["plutomi.com"],
        hostedZone: HostedZone.fromHostedZoneAttributes(this, "HostedZone", {
          hostedZoneId: "Z0292750WT8Z1OMEVXMS",
          zoneName: "plutomi.com",
        }),
        certificate: Certificate.fromCertificateArn(
          this,
          "DomainCertificate",
          "arn:aws:acm:us-east-1:973002006250:certificate/dc989fd0-9c90-4bc7-88f0-0b6ff769b80c"
        ),
      },
    });
  }
}
