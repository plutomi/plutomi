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

    const emailsToSend: SendEmailProps[] = [
      {
        to: user.email,
        from: {
          header: 'Plutomi',
          email: Emails.GENERAL,
        },
        subject: 'Welcome to Plutomi!',
        body: `<h1>Hello there!</h1><p>Just wanted to make you aware that this website is still in active development and <strong>you will lose your data!</strong><br><br>
        This project is completely open source - please let us know if you have any questions, concerns, or feature requests by replying to this email or <a href="https://github.com/plutomi/plutomi" rel=noreferrer target="_blank" >creating an issue on Github</a>!</p>`,
      },
      {
        from: {
          header: `Plutomi`,
          email: Emails.ADMIN,
        },
        to: Emails.ADMIN,
        subject: `New user has joined! - ${user.email}`,
        body: `<h1>Their ID is ${user.userId}</h1>`,
      },
    ];

    try {
      console.log(`Sending emails:`, emailsToSend);
      await Promise.all(emailsToSend.map((email) => sendEmail(email)));
      return;
    } catch (error) {
      console.error('Error ocurred sending new user emails', error);
    }
  }
}
