#!/usr/bin/env node
import * as cdk from "@aws-cdk/core";
import "source-map-support";
import { DynamoDBStack } from "../lib/DynamoDBStack";
import PlutomiWebsiteStack from "../lib/PlutomiWebsiteStack";
import { CdkStarterStack } from "../lib/PublicInfoServiceStack";
const app = new cdk.App();

new CdkStarterStack(app, "CdkStarterStack");

// new PlutomiWebsiteStack(app, "PlutomiWebsiteStack");
// new DynamoDBStack(app, "DynamoDBStack");
