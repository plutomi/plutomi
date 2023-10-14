#!/usr/bin/env node
/* eslint-disable import/first */
import * as dotenv from "dotenv";

dotenv.config();

import "source-map-support";
import * as cdk from "aws-cdk-lib";
import { PlutomiStack } from "../lib";

const plutomiApp = new cdk.App();

void new PlutomiStack(plutomiApp, "plutomi", {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION
  }
});
