#!/usr/bin/env node
/* eslint-disable import/first */
import * as dotenv from "dotenv";

dotenv.config();

import "source-map-support";
import * as cdk from "aws-cdk-lib";
import { env } from "../utils";
import { PlutomiStack } from "../lib/plutomiStack";

const plutomiApp = new cdk.App();

void new PlutomiStack(plutomiApp, `${env.DEPLOYMENT_ENVIRONMENT}-plutomi`);
