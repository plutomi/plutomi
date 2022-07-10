import { EventBridgeEvent } from 'aws-lambda';
import axios from 'axios';
import { DB } from '../models';
import { CustomEventBridgeEvent } from './stream-processor';

export async function main(event: EventBridgeEvent<'stream', CustomEventBridgeEvent>) {
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
    await Promise.all(
      webhooks.map(async (hook) => axios.post(hook.webhookUrl, { ...event.detail })),
    );
    console.log('Webhooks sent!');
  } catch (err) {
    console.error(
      `An error ocurred sending webhooks to org ${event.detail.orgId} --- ${webhooks}`,
      err,
    );
  }
}
