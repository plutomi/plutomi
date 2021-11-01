#!/usr/bin/env node
import * as cdk from "@aws-cdk/core";
import "source-map-support";
import APIStack from "../lib/APIStack";

const app = new cdk.App();

new APIStack(app, "PlutmiApiStack");
