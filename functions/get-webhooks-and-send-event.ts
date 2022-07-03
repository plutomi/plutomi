import { EventBridgeEvent } from 'aws-lambda';
import axios from 'axios';
import { DynamoStreamTypes, Entities } from '../Config';
import { DynamoApplicant } from '../types/dynamo';
import { DB } from '../models';

// TODO this type needs to be extended and create a base type
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
  const [webhooks, error] = await DB.Webhooks.getWebhooksInOrg({
    orgId: event.detail.orgId,
  });

  if (error) {
    console.error(`Unable to retrieve webhooks in org`, error);
    return;
  }

  if (!webhooks.length) {
    console.info('No webhooks found in org');
    return;
  }

  console.log('Sending webhooks...');
  try {
    await Promise.all(webhooks.map((hook) => axios.post(hook.webhookUrl, { ...event.detail })));
    console.log('Webhooks sent!');
  } catch (err) {
    console.error(
      `An error ocurred sending webhooks to org ${event.detail.orgId} --- ${webhooks}`,
      err,
    );
  }
}
