#!/usr/bin/env node
import 'source-map-support';
import * as cdk from 'aws-cdk-lib';
import AppStack from '../lib/AppStack';
import StorageStack from '../lib/StorageStack';
import { envVars } from '../../env';

const app = new cdk.App();
const { bucket } = new StorageStack(
  app,
  `${envVars.NEXT_PUBLIC_DEPLOYMENT_ENVIRONMENT}-StorageStack`,
);

new AppStack(app, `${envVars.NEXT_PUBLIC_DEPLOYMENT_ENVIRONMENT}-AppStack`, {});
