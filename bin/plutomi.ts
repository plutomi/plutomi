#!/usr/bin/env node
import * as cdk from "@aws-cdk/core";
import "source-map-support";
import { Builder } from "@sls-next/lambda-at-edge";
import { PlutomiFrontendStack } from "../lib/FrontendStack";
import PlutomiWebsiteStack from "../lib/WebsiteStack";
import { APIGatewayStack } from "../lib/APIGatewayStack";

// Run the serverless builder, this could be done elsewhere in your workflow
const builder = new Builder(".", "./build", { args: ["build"] });

try {
  builder.build(); // For SLS construct
  const app = new cdk.App();

  // Deploys the fargate website (TODO remove)
  new PlutomiWebsiteStack(app, "PlutomiWebsiteStack");

  // Deploys the website to cloudfront / S3
  new PlutomiFrontendStack(app, "PlutomiFrontendStack");

  // Creates API Gateway
  const API_GATEWAY = new APIGatewayStack(app, "PlutomiAPIGatewayStack");

  new PublicInfoServiceStack(app, "PublicInfoServiceStack", {
    API: API_GATEWAY.API,
  });
} catch (error) {
  console.log(error);
  process.exit(1);
}
