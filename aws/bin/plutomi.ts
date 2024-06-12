#!/usr/bin/env node
import * as dotenv from "dotenv";
import * as path from "path";
const environment = process.env.ENVIRONMENT || "development";
dotenv.config({ path: path.resolve(__dirname, `../.env.${environment}`) });

import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { PlutomiStack } from "../lib/plutomi-stack";

const app = new cdk.App();

new PlutomiStack(app, "PlutomiStack", {
  /* If you don't specify 'env', this stack will be environment-agnostic.
   * Account/Region-dependent features and context lookups will not work,
   * but a single synthesized template can be deployed anywhere. */
  /* Uncomment the next line to specialize this stack for the AWS Account
   * and Region that are implied by the current CLI configuration. */
  // env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
  /* Uncomment the next line if you know exactly what Account and Region you
   * want to deploy the stack to. */
  // env: { account: '123456789012', region: 'us-east-1' },
  /* For more information, see https://docs.aws.amazon.com/cdk/latest/guide/environments.html */
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});
