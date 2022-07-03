import { EventBridgeEvent } from 'aws-lambda';
import axios from 'axios';
import { DynamoStreamTypes, Entities } from '../Config';
import { DynamoApplicant, DynamoLoginLink, DynamoOrgLoginEvent, DynamoUser, DynamoUserLoginEvent } from '../types/dynamo';
import { DB } from '../models';
import { BaseEvent, ExtendedEvent, ExtendedEventKeys } from './stream-processor';

type EntitiesToTriggerComms = DynamoLoginLink | DynamoUser | DynamoUserLoginEvent | DynamoOrgLoginEvent | DynamoApplicant
interface CommsMachineEvents extends BaseEvent, Pick<EntitiesToTriggerComms, ExtendedEventKeys> {}

export async function main(event: EventBridgeEvent<'stream', CommsMachineEvents>) {

  if (event.detail.entityType ===  Entities.USER_LOGIN_EVENT) {
    
    if (event.detail.PK === "beans")
    // TODO update the verified email status on the user
    
    const [updated, failed] = await DB.Users.updateUser({
      userId: event.detail.NewImage.

    // TODO send an email to the admin letting them know


    // TODO send an email to the user welcoming them
  }




    const [updatedUser, error] = await DB.Users.updateUser({
        userId: event.detail.
    })
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
