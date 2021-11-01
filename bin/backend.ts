#!/usr/bin/env node
import * as cdk from "@aws-cdk/core";
import "source-map-support";
import { ApiGatewayStack } from "../lib/api-gateway-stack";
import { PublicInfoServiceStack } from "../lib/public-info-service-stack";
const app = new cdk.App();

const API_GATEWAY = new ApiGatewayStack(app, "ApiGatewayStack");

new PublicInfoServiceStack(app, "PublicInfoServiceStack", {
  API: API_GATEWAY.API,
});
