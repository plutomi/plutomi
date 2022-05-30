import { StepFunctionsInvokeActivity } from '@aws-cdk/aws-stepfunctions-tasks';
import { EventBridgeEvent } from 'aws-lambda';
import { DynamoStreamTypes, Entities } from '../Config';
import { DynamoApplicant } from '../types/dynamo';
import * as Webhooks from '../models/Webhooks';
import axios from 'axios';

interface ApplicantWebhookEvent {
  eventName: DynamoStreamTypes;
  NewImage?: DynamoApplicant;
  OldImage?: DynamoApplicant;
  PK: `${Entities.ORG}#${string}#${Entities.APPLICANT}#${string}`;
  SK: string;
  entityType: Entities.APPLICANT;
  orgId: string;
}

export async function main(event: EventBridgeEvent<'stream', ApplicantWebhookEvent>) {
  const [webhooks, error] = await Webhooks.GetWebhooksInOrg({
    orgId: event.detail.orgId,
  });

  if (error) {
    console.error(`Unable to retrieve webhooks in org`, error);
    return;
  }

  if (!webhooks.length) {
    console.log('No webhooks found in org');
    return;
  }

  console.log('Sending webhooks...');
  try {
    await Promise.all(webhooks.map((hook) => axios.post(hook.webhookUrl, { ...event.detail })));
    console.log('Webhooks sent!');
  } catch (error) {
    console.error(`An error ocurred sending webhooks to org ${event.detail.orgId} --- ${webhooks}`);
  }

  return;
}
