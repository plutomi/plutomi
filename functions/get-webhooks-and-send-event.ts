import { EventBridgeEvent } from 'aws-lambda';
import axios from 'axios';
import { DynamoApplicant } from '../types/dynamo';
import { DB } from '../models';
import { BaseEvent, ExtendedEventKeys } from './stream-processor';

interface ApplicantWebhookEvent extends BaseEvent, Pick<DynamoApplicant, ExtendedEventKeys> {}

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
