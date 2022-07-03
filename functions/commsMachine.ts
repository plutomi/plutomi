import { EventBridgeEvent } from 'aws-lambda';
import axios from 'axios';
import { DynamoStreamTypes, Entities } from '../Config';
import { DynamoApplicant, DynamoLoginLink, DynamoOrgLoginEvent, DynamoUser, DynamoUserLoginEvent } from '../types/dynamo';
import { DB } from '../models';
import { CustomEventBridgeEvent } from './stream-processor';



export async function main(event: EventBridgeEvent<'stream', CustomEventBridgeEvent>) {


  
  if (event.detail.NewImage.entityType === Entities.USER_LOGIN_EVENT) {
    
    if (!event.detail.NewImage.user.verifiedEmail) {
      
    }
  }

  if (typeof event.detail.NewImage === Entities.USER_LOGIN_EVENT) {
    event.detail.NewImage.

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
