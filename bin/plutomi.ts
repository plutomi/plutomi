#!/usr/bin/env node
import * as cdk from "@aws-cdk/core";
import "source-map-support";
import DynamoDBStack from "../lib/DynamoDBStack";
import APIStack from "../lib/APIStack";
import { Builder } from "@sls-next/lambda-at-edge";
import FrontendStack from "../lib/FrontendStack";
import StreamProcessorStack from "../lib/StreamProcessorStack";
import NewUserStack from "../lib/NewUserStack";
import CommsMachineStack from "../lib/CommsMachineStack";
import EventBridgeStack from "../lib/EventBridgeStack";
// Run the serverless builder before deploying
const builder = new Builder(".", "./build", { args: ["build"] });

builder
  .build()
  .then(() => {
    const app = new cdk.App();
    const { table } = new DynamoDBStack(app, "DynamoDBStack");
    const { StreamProcessorFunction } = new StreamProcessorStack(
      app,
      `StreamProcessorStack`,
      {
        table,
      }
    );

    new APIStack(app, "APIStack", {
      table,
    });
    const {
      SendLoginLinkQueue,
      NewUserAdminEmailQueue,
      NewUserVerifiedEmailQueue,
    } = new NewUserStack(app, `NewUserStack`, {
      table,
    });

    const { CommsMachine } = new CommsMachineStack(app, `CommsMachineStack`, {
      table,
    });

    new EventBridgeStack(app, `EventBridgeStack`, {
      StreamProcessorFunction,
      SendLoginLinkQueue,
      NewUserAdminEmailQueue,
      NewUserVerifiedEmailQueue,
      CommsMachine,
    });
    new FrontendStack(app, `FrontendStack`);
  })
  .catch((e) => {
    console.log(e);
    process.exit(1);
  });
