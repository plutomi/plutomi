#!/usr/bin/env node
import "source-map-support";
import * as cdk from "@aws-cdk/core";
import APIStack from "../lib/APIStack";
import DynamoDBStack from "../lib/DynamoDBStack";
import FrontendStack from "../lib/FrontendStack";
import EventBridgeStack from "../lib/EventBridgeStack";
import CommsMachineStack from "../lib/commsMachineStack";
import StreamProcessorStack from "../lib/StreamProcessorStack";

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
