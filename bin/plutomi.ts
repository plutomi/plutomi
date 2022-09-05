#!/usr/bin/env node
import 'source-map-support';
import * as cdk from 'aws-cdk-lib';
import * as dotenv from 'dotenv';
import AppStack from '../lib/AppStack';
import DynamoDBStack from '../lib/DynamoDBStack';
import EventBridgeStack from '../lib/EventBridgeStack';
import StreamProcessorStack from '../lib/StreamProcessorStack';
import DeleteChildrenMachineStack from '../lib/DeleteChildrenMachineStack';
import WebhooksMachineStack from '../lib/WebhooksMachineStack';
import StorageStack from '../lib/StorageStack';
import CiCdPipelineStack from '../lib/CiCdPipelineStack';
// TODO delete this file!

const app = new cdk.App();
const pipeline = new CiCdPipelineStack(app, `PlutomiCiCdPipelineStack`);
