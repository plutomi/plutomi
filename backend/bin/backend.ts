#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "@aws-cdk/core";
import { ApiGatewayStack } from "../lib/api-gateway-stack";

const app = new cdk.App();
new ApiGatewayStack(app, "ApiGatewayStack", {
  /**
   * Uncomment the next line to specialize this stack for the AWS Account
   * env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION }
   */
});
