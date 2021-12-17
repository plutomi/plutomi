#!/usr/bin/env node
import * as cdk from "@aws-cdk/core";
import "source-map-support";
import DynamoDBStack from "../lib/DynamoDBStack";
import APIStack from "../lib/APIStack";
import { Builder } from "@sls-next/lambda-at-edge";
import FrontendStack from "../lib/FrontendStack";
import StreamProcessorStack from "../lib/StreamProcessorStack";
import SendLoginLinkStack from "../lib/SendLoginLinkStack";
// Run the serverless builder before deploying
const builder = new Builder(".", "./build", { args: ["build"] });

builder
  .build()
  .then(() => {
    const app = new cdk.App();
    const { table } = new DynamoDBStack(app, "DynamoDBStack");
    new APIStack(app, "APIStack", {
      table,
    });
    const { sendLoginLinkQueue } = new SendLoginLinkStack(
      app,
      `SendLoginLinkStack1`,
      { table }
    );

    new FrontendStack(app, `FrontendStack`);
    new StreamProcessorStack(app, `StreamProcessorStack`, {
      table,
      sendLoginLinkQueue,
    });
  })
  .catch((e) => {
    console.log(e);
    process.exit(1);
  });
