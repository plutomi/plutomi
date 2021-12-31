import * as dotenv from "dotenv";
import * as cdk from "@aws-cdk/core";
import { HostedZone } from "@aws-cdk/aws-route53";
import { NextJSLambdaEdge } from "@sls-next/cdk-construct";
import { Certificate } from "@aws-cdk/aws-certificatemanager";
import { DOMAIN_NAME } from "../Config";

const resultDotEnv = dotenv.config({
  path: __dirname + `../../.env.${process.env.NODE_ENV}`,
});

if (resultDotEnv.error) {
  throw resultDotEnv.error;
}

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
        domainNames: [DOMAIN_NAME],
        hostedZone: HostedZone.fromHostedZoneAttributes(this, "HostedZone", {
          hostedZoneId: process.env.HOSTED_ZONE_ID,
          zoneName: DOMAIN_NAME,
        }),
        certificate: Certificate.fromCertificateArn(
          this,
          "DomainCertificate",
          `arn:aws:acm:${cdk.Stack.of(this).region}:${
            cdk.Stack.of(this).account
          }:certificate/${process.env.ACM_CERTIFICATE_ID}`
        ),
      },
    });
  }
}
