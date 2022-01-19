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
import APIOpeningsServiceStack from "../lib/APIOpeningsServiceStack";
import APIStagesServiceStack from "../lib/APIStagesServiceStack";
import APIApplicantsServiceStack from "../lib/APIApplicantsServiceStack";
import APIPublicInfoServiceStack from "../lib/APIPublicInfoServiceStack";

import { Builder } from "@sls-next/lambda-at-edge";
import { nanoid } from "nanoid";
import { NodejsFunctionProps } from "@aws-cdk/aws-lambda-nodejs";
import { Architecture, Runtime } from "@aws-cdk/aws-lambda";
import { RetentionDays } from "@aws-cdk/aws-logs";
/**
 * You can easily override these settings when declaring your function.
 * For API Gateway lambdas, these settings are used in the createAPIGatewayFunctions.ts file
 * Setting this in Config.ts throws webpack errors.
 */
export const DEFAULT_LAMBDA_CONFIG: NodejsFunctionProps = {
  functionName: `unnamed-function-${nanoid(20)}`,
  reservedConcurrentExecutions: 1,
  timeout: cdk.Duration.seconds(5),
  memorySize: 256,
  logRetention: RetentionDays.ONE_WEEK,
  runtime: Runtime.NODEJS_14_X,
  architecture: Architecture.ARM_64,
  bundling: {
    minify: true,
    externalModules: ["aws-sdk"],
  },
  handler: "main",
};

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

    const { api } = new APIStack(app, `${process.env.NODE_ENV}-APIStack`, {
      table,
    });

    new APIUsersServiceStack(
      app,
      `${process.env.NODE_ENV}-APIUsersServiceStack`,
      { api, table }
    );

    new APIOrgsServiceStack(
      app,
      `${process.env.NODE_ENV}-APIOrgsServiceStack`,
      { api, table }
    );
    new APIInvitesServiceStack(
      app,
      `${process.env.NODE_ENV}-APIInvitesServiceStack`,
      { api, table }
    );
    new APIPublicInfoServiceStack(
      app,
      `${process.env.NODE_ENV}-APIPublicInfoServiceStack`,
      { api, table }
    );
    new APIAuthServiceStack(
      app,
      `${process.env.NODE_ENV}-APIAuthServiceStack`,
      { api, table }
    );

    new APIOpeningsServiceStack(
      app,
      `${process.env.NODE_ENV}-APIOpeningsServiceStack`,
      { api, table }
    );

    new APIApplicantsServiceStack(
      app,
      `${process.env.NODE_ENV}-APIApplicantsServiceStack`,
      { api, table }
    );

    const { CommsMachine } = new CommsMachineStack(
      app,
      `${process.env.NODE_ENV}-CommsMachineStack`,
      {
        table,
      }
    );

    new APIStagesServiceStack(
      app,
      `${process.env.NODE_ENV}-APIStagesServiceStack`,
      { api, table }
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
