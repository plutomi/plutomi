import { EventBridgeEvent } from 'aws-lambda';
import { Emails, Entities } from '../Config';
import { CustomEventBridgeEvent } from './stream-processor';
import { sendEmail, SendEmailProps } from '../models/Emails/sendEmail';

export async function main(event: EventBridgeEvent<'stream', CustomEventBridgeEvent>) {
  console.log('Incoming event:', JSON.stringify(event));

  if (
    event.detail.NewImage.entityType === Entities.USER_LOGIN_EVENT &&
    !event.detail.NewImage.user.verifiedEmail
  ) {
    console.log(`User is logging in for the first time`);
    const { user } = event.detail.NewImage;
  }
}
