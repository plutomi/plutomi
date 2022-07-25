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
import AthenaDynamoQueryStack from '../lib/AthenaDynamoQueryStack';
import StorageStack from '../lib/StorageStack';
// TODO use relative path
const resultDotEnv = dotenv.config({
  path: `${process.cwd()}\\.env.${process.env.NODE_ENV}`,
});

if (resultDotEnv.error) {
  throw resultDotEnv.error;
}

const app = new cdk.App();
const { bucket } = new StorageStack(app, `${process.env.NODE_ENV}-StorageStack`);

const { table } = new DynamoDBStack(app, `${process.env.NODE_ENV}-DynamoDBStack`);

new AppStack(app, `${process.env.NODE_ENV}-AppStack`, {
  table,
});

const { DeleteChildrenMachine } = new DeleteChildrenMachineStack(
  app,
  `${process.env.NODE_ENV}-DeleteChildrenMachineStack`,
  {
    table,
  },
);

const { WebhooksMachine } = new WebhooksMachineStack(
  app,
  `${process.env.NODE_ENV}-WebhooksMachineStack`,
  {
    table,
  },
);
new EventBridgeStack(app, `${process.env.NODE_ENV}-EventBridgeStack`, {
  DeleteChildrenMachine,
  WebhooksMachine,
});

new StreamProcessorStack(app, `${process.env.NODE_ENV}-StreamProcessorStack`, {
  table,
});
new AthenaDynamoQueryStack(app, `${process.env.NODE_ENV}-AthenaDynamoQueryStack`, {
  table,
  bucket,
});
