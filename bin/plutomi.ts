#!/usr/bin/env node
import * as cdk from "@aws-cdk/core";
import "source-map-support";

import PlutomiWebsiteStack from "../lib/PlutomiWebsiteStack";

const app = new cdk.App();

new PlutomiWebsiteStack(app, "PlutomiWebsiteStack");
