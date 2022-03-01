#!/usr/bin/env node
import "source-map-support";
import * as cdk from "@aws-cdk/core";
import APIStack from "../lib/APIStack";
import DynamoDBStack from "../lib/DynamoDBStack";
import FrontendStack from "../lib/FrontendStack";
import EventBridgeStack from "../lib/EventBridgeStack";
import CommsMachineStack from "../lib/CommsMachineStack";
import StreamProcessorStack from "../lib/StreamProcessorStack";
import DeleteChildrenMachineStack from "../lib/DeleteChildrenMachineStack";
import WebhooksMachineStack from "../lib/WebhooksMachineStack";
import AthenaDynamoQueryStack from "../lib/AthenaDynamoQueryStack";
import { Builder } from "@sls-next/lambda-at-edge";
import StorageStack from "../lib/StorageStack";
// Run the serverless builder before deploying
const builder = new Builder(".", "./build", { args: ["build"] });

builder
  .build()
  .then(() => {
    const app = new cdk.App();
    const { bucket } = new StorageStack(
      app,
      `${process.env.NODE_ENV}-StorageStack`
    );

    const { table } = new DynamoDBStack(
      app,
      `${process.env.NODE_ENV}-DynamoDBStack`
    );

    new APIStack(app, `${process.env.NODE_ENV}-APIStack`, {
      table,
    });

    const { CommsMachine } = new CommsMachineStack(
      app,
      `${process.env.NODE_ENV}-CommsMachineStack`,
      {
        table,
      }
    );

    const { DeleteChildrenMachine } = new DeleteChildrenMachineStack(
      app,
      `${process.env.NODE_ENV}-DeleteChildrenMachineStack`,
      {
        table,
      }
    );

    const { WebhooksMachine } = new WebhooksMachineStack(
      app,
      `${process.env.NODE_ENV}-WebhooksMachineStack`,
      {
        table,
      }
    );
    new EventBridgeStack(app, `${process.env.NODE_ENV}-EventBridgeStack`, {
      CommsMachine,
      DeleteChildrenMachine,
      WebhooksMachine,
    });

    new StreamProcessorStack(
      app,
      `${process.env.NODE_ENV}-StreamProcessorStack`,
      {
        table,
      }
    );
    new AthenaDynamoQueryStack(
      app,
      `${process.env.NODE_ENV}-AthenaDynamoQueryStack`,
      {
        table,
        bucket,
      }
    );

    // Run FE locally, no need to deploy
    new FrontendStack(app, `FrontendStack`);
  })
  .catch((e) => {
    console.log(e);
    process.exit(1);
  });
