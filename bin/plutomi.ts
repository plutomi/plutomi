#!/usr/bin/env node
import * as cdk from "@aws-cdk/core";
import "source-map-support";
import DynamoDBStack from "../lib/DynamoDBStack";
import APIStack from "../lib/APIStack";
import { Builder } from "@sls-next/lambda-at-edge";
import FrontendStack from "../lib/FrontendStack";
import StreamProcessorStack from "../lib/StreamProcessorStack";
import NewUserStack from "../lib/NewUserStack";
import StateMachine from "../lib/StateMachine";
// Run the serverless builder before deploying
const builder = new Builder(".", "./build", { args: ["build"] });

builder
  .build()
  .then(() => {
    const app = new cdk.App();
    const { table } = new DynamoDBStack(app, "DynamoDBStack");
    const { StreamProcessorTopic } = new StreamProcessorStack(
      app,
      `StreamProcessorStack`,
      {
        table,
      }
    );

    new APIStack(app, "APIStack", {
      table,
    });
    new NewUserStack(app, `NewUserStack`, {
      table,
    });

    new StateMachine(app, `StateMachine`, {
      table,
    });
    new FrontendStack(app, `FrontendStack`);
  })
  .catch((e) => {
    console.log(e);
    process.exit(1);
  });
