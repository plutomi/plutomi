#!/usr/bin/env node
import * as cdk from "@aws-cdk/core";
import "source-map-support";

import { Builder } from "@sls-next/lambda-at-edge";
import { PlutomiFrontendStack } from "../lib/PlutomiFrontendStack";
import PlutomiWebsiteStack from "../lib/PlutomiWebsiteStack";

// Run the serverless builder, this could be done elsewhere in your workflow
const builder = new Builder(".", "./build", { args: ["build"] });

try {
  builder.build(); // For SLS construct
  const app = new cdk.App();
  new PlutomiWebsiteStack(app, "PlutomiWebsiteStack");
  new PlutomiFrontendStack(app, "PlutomiFrontendStack");
} catch (error) {
  console.log(error);
  process.exit(1);
}
