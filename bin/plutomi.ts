#!/usr/bin/env node
import 'source-map-support';
import * as cdk from 'aws-cdk-lib';
import AppStack from '../lib/AppStack';
import DynamoDBStack from '../lib/DynamoDBStack';
import EventBridgeStack from '../lib/EventBridgeStack';
import StreamProcessorStack from '../lib/StreamProcessorStack';
import DeleteChildrenMachineStack from '../lib/DeleteChildrenMachineStack';
import WebhooksMachineStack from '../lib/WebhooksMachineStack';
import AthenaDynamoQueryStack from '../lib/AthenaDynamoQueryStack';
import StorageStack from '../lib/StorageStack';

const app = new cdk.App();
const { bucket } = new StorageStack(app, `${process.env.DEPLOYMENT_ENVIRONMENT}-StorageStack`);

const { table } = new DynamoDBStack(app, `${process.env.DEPLOYMENT_ENVIRONMENT}-DynamoDBStack`);

new AppStack(app, `${process.env.DEPLOYMENT_ENVIRONMENT}-AppStack`, {
  table,
});

const { DeleteChildrenMachine } = new DeleteChildrenMachineStack(
  app,
  `${process.env.DEPLOYMENT_ENVIRONMENT}-DeleteChildrenMachineStack`,
  {
    table,
  },
);

const { WebhooksMachine } = new WebhooksMachineStack(
  app,
  `${process.env.DEPLOYMENT_ENVIRONMENT}-WebhooksMachineStack`,
  {
    table,
  },
);
new EventBridgeStack(app, `${process.env.DEPLOYMENT_ENVIRONMENT}-EventBridgeStack`, {
  DeleteChildrenMachine,
  WebhooksMachine,
});

new StreamProcessorStack(app, `${process.env.DEPLOYMENT_ENVIRONMENT}-StreamProcessorStack`, {
  table,
});
new AthenaDynamoQueryStack(app, `${process.env.DEPLOYMENT_ENVIRONMENT}-AthenaDynamoQueryStack`, {
  table,
  bucket,
});
