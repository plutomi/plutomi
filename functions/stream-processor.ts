import { DynamoDBStreamEvent } from 'aws-lambda';
import { PutEventsCommand, PutEventsCommandInput } from '@aws-sdk/client-eventbridge';
import { PutEventsRequestEntry } from 'aws-sdk/clients/eventbridge';
import errorFormatter from '../utils/errorFormatter';
import EBClient from '../awsClients/eventBridgeClient';

const processor = require('dynamodb-streams-processor');

export async function main(event: DynamoDBStreamEvent) {
  // Was reading a bit and this came up https://github.com/aws/aws-sdk-js/issues/2486
  const record = processor(event.Records)[0];
  const { eventName } = record;
  const { OldImage, NewImage } = record.dynamodb;
  console.log(OldImage);
  console.log(NewImage);

  const entry: PutEventsRequestEntry = {
    Source: 'dynamodb.streams',
    // Note, if we ever use AWS events directly, they will go to the default event bus and not this one.
    // This is for easy dev / prod testing
    EventBusName: `${process.env.NODE_ENV}-EventBus`,
    DetailType: 'stream',
    Detail: JSON.stringify({
      eventName,
      OldImage,
      NewImage,
      /**
       * Entity types can never be updated by the user so..
       * adding this extra field here allows creating rules in EventBridge
       * for specific event types {@link DynamoStreamTypes} and a
       * specific {@link Entities}.
       *
       * The use case for this is, send *all* applicant events (insert, update, delete)
       * to the webhooks step functions. From there, the step function
       * is solely in charge of checking if a message needs to be triggerred.
       *
       * Ideally, you would be able to filter on NewImage OR OldImage, but if you supply both in the EB Rule,
       * they BOTH have to match. In the case of a NEW APPLICANT event, oldImage does not exist!
       */
      PK: NewImage?.PK || OldImage?.PK,
      SK: NewImage?.orgId || OldImage?.SK,
      entityType: NewImage?.entityType || OldImage?.entityType,
      orgId: NewImage?.orgId || OldImage?.orgId,
    }),
  };

  const newEvent: PutEventsCommandInput = {
    Entries: [entry],
  };
  try {
    console.log(entry);
    await EBClient.send(new PutEventsCommand(newEvent));
    console.log('Message sent to EventBridge!', newEvent);

    return;
  } catch (error) {
    console.error('Unable to send message to EventBridge');
    console.error(errorFormatter(error));
  }
}
