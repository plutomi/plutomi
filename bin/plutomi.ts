#!/usr/bin/env node
import "source-map-support";
import * as cdk from "@aws-cdk/core";
import APIStack from "../lib/APIStack";
import DynamoDBStack from "../lib/DynamoDBStack";
import FrontendStack from "../lib/FrontendStack";
import EventBridgeStack from "../lib/EventBridgeStack";
import CommsMachineStack from "../lib/commsMachineStack";
import APIAuthServiceStack from "../lib/APIAuthServiceStack";
import StreamProcessorStack from "../lib/StreamProcessorStack";
import APIUsersServiceStack from "../lib/APIUsersServiceStack";
import APIOrgsServiceStack from "../lib/APIOrgsServiceStack";
import APIInvitesServiceStack from "../lib/APIInvitesServiceStack";
import { Builder } from "@sls-next/lambda-at-edge";

// Run the serverless builder before deploying
const builder = new Builder(".", "./build", { args: ["build"] });

builder
  .build()
  .then(() => {
    const app = new cdk.App();
    const { table } = new DynamoDBStack(
      app,
      `${process.env.NODE_ENV}-DynamoDBStack`
    );

    const {
      getUserByIdFunction,
      updateUserFunction,
      getSelfInfoFunction,
      getUsersInOrgFunction,
    } = new APIUsersServiceStack(
      app,
      `${process.env.NODE_ENV}-APIUsersServiceStack`,
      {
        table,
      }
    );

    const { createOrgFunction, getOrgInfoFunction, deleteOrgFunction } =
      new APIOrgsServiceStack(
        app,
        `${process.env.NODE_ENV}-APIOrgsServiceStack`,
        { table }
      );
    const { api } = new APIStack(app, `${process.env.NODE_ENV}-APIStack`, {
      deleteOrgFunction,
      getSelfInfoFunction,
      getUserByIdFunction,
      updateUserFunction,
      createOrgFunction,
      getOrgInfoFunction,
      getUsersInOrgFunction,
    });

    new APIInvitesServiceStack(
      app,
      `${process.env.NODE_ENV}-APIInvitesServiceStack`,
      {
        table,
        api,
      }
    );
    new APIAuthServiceStack(
      app,
      `${process.env.NODE_ENV}-APIAuthServiceStack`,
      {
        table,
        api,
      }
    );

    const { CommsMachine } = new CommsMachineStack(
      app,
      `${process.env.NODE_ENV}-CommsMachineStack`,
      {
        table,
      }
    );

    new EventBridgeStack(app, `${process.env.NODE_ENV}-EventBridgeStack`, {
      CommsMachine,
    });

    new StreamProcessorStack(
      app,
      `${process.env.NODE_ENV}-StreamProcessorStack`,
      {
        table,
      }
    );

    // Run FE locally, no need to deploy
    new FrontendStack(app, `FrontendStack`);
  })
  .catch((e) => {
    console.log(e);
    process.exit(1);
  });
