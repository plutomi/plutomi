#!/usr/bin/env node
import 'source-map-support';
import * as cdk from 'aws-cdk-lib';
import AppStack from '../lib/AppStack';
// TODO bring these back
import EventBridgeStack from '../lib/EventBridgeStack';
import DeleteChildrenMachineStack from '../lib/DeleteChildrenMachineStack';
import WebhooksMachineStack from '../lib/WebhooksMachineStack';
import StorageStack from '../lib/StorageStack';
import { env } from '../env';

const app = new cdk.App();
const { bucket } = new StorageStack(app, `${env.deploymentEnvironment}-StorageStack`);

new AppStack(app, `${env.deploymentEnvironment}-AppStack`, {});

// const { DeleteChildrenMachine } = new DeleteChildrenMachineStack(
//   app,
//   `${env.deploymentEnvironment}-DeleteChildrenMachineStack`,
// );

// const { WebhooksMachine } = new WebhooksMachineStack(
//   app,
//   `${env.deploymentEnvironment}-WebhooksMachineStack`,
// );

// new EventBridgeStack(app, `${env.deploymentEnvironment}-EventBridgeStack`, {
//   DeleteChildrenMachine,
//   WebhooksMachine,
// });
