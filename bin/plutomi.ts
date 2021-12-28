#!/usr/bin/env node
import * as cdk from "@aws-cdk/core";
import "source-map-support";
import DynamoDBStack from "../lib/DynamoDBStack";
import APIStack from "../lib/APIStack";
import FrontendStack from "../lib/FrontendStack";
import StreamProcessorStack from "../lib/StreamProcessorStack";
import CommsMachineStack from "../lib/commsMachineStack";
import EventBridgeStack from "../lib/EventBridgeStack";
import { Builder } from "@sls-next/lambda-at-edge";

// Run the serverless builder before deploying
const builder = new Builder(".", "./build", { args: ["build"] });

builder
  .build()
  .then(() => {
    const app = new cdk.App();
    const { table } = new DynamoDBStack(app, "DynamoDBStack");
    new StreamProcessorStack(app, `StreamProcessorStack`, {
      table,
    });
    new APIStack(app, "APIStack", {
      table,
    });

    const { CommsMachine } = new CommsMachineStack(app, `CommsMachineStack`, {
      table,
    });

    new EventBridgeStack(app, `EventBridgeStack`, {
      CommsMachine,
    });
    new FrontendStack(app, `FrontendStack`);
  })
  .catch((e) => {
    console.log(e);
    process.exit(1);
  });
