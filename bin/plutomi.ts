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
import { env } from '../env';

const app = new cdk.App();
const { bucket } = new StorageStack(app, `${env.deploymentEnvironment}-StorageStack`);

const { table } = new DynamoDBStack(app, `${env.deploymentEnvironment}-DynamoDBStack`);

new AppStack(app, `${env.deploymentEnvironment}-AppStack`, {
  table,
});

const { DeleteChildrenMachine } = new DeleteChildrenMachineStack(
  app,
  `${env.deploymentEnvironment}-DeleteChildrenMachineStack`,
  {
    table,
  },
);

const { WebhooksMachine } = new WebhooksMachineStack(
  app,
  `${env.deploymentEnvironment}-WebhooksMachineStack`,
  {
    table,
  },
);
new EventBridgeStack(app, `${env.deploymentEnvironment}-EventBridgeStack`, {
  DeleteChildrenMachine,
  WebhooksMachine,
});

new StreamProcessorStack(app, `${env.deploymentEnvironment}-StreamProcessorStack`, {
  table,
});
new AthenaDynamoQueryStack(app, `${env.deploymentEnvironment}-AthenaDynamoQueryStack`, {
  table,
  bucket,
});
