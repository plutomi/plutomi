#!/usr/bin/env node
import * as cdk from "@aws-cdk/core";
import "source-map-support";
import { Builder } from "@sls-next/lambda-at-edge";
import { APIGatewayStack } from "../lib/APIGatewayStack";
import { PublicInfoServiceStack } from "../lib/PublicInfoServiceStack";
import { FrontendStack } from "../lib/FrontendStack";

const app = new cdk.App();

// Run the serverless builder, this could be done elsewhere in your workflow
const builder = new Builder(".", "./build", { args: ["build"] });

try {
  builder.build(); // For SLS construct

  // Deploys the website to cloudfront / S3
  new FrontendStack(app, "FrontendStack");

  // Creates API Gateway
  const API_GATEWAY = new APIGatewayStack(app, "APIGatewayStack");

  // Deploys the /public route lambdas
  new PublicInfoServiceStack(app, "PublicInfoServiceStack", {
    API: API_GATEWAY.API,
  });
} catch (error) {
  console.log(error);
  process.exit(1);
}
