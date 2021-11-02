#!/usr/bin/env node
import * as cdk from "@aws-cdk/core";
import "source-map-support";
import APIStack from "../lib/FargateAPIStack";

const app = new cdk.App();

new APIStack(app, "PlutomiApiStack"); // TODO fix this name lol
