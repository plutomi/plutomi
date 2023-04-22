#!/usr/bin/env node
import "source-map-support";
import * as cdk from "aws-cdk-lib";
import { env } from "../env";
import { PlutomiStack } from "../lib/plutomiStack";

const plutomiApp = new cdk.App();

void new PlutomiStack(plutomiApp, `${env.DEPLOYMENT_ENVIRONMENT}-PlutomiStack`);
