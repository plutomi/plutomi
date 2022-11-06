#!/usr/bin/env node
import 'source-map-support';
import * as cdk from 'aws-cdk-lib';
import AppStack from '../lib/AppStack';
import StorageStack from '../lib/StorageStack';
import { env } from '../env';

const app = new cdk.App();
const { bucket } = new StorageStack(app, `${env.deploymentEnvironment}-StorageStack`);

new AppStack(app, `${env.deploymentEnvironment}-AppStack`, {});