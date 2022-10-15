import { DynamoDBStreamEvent } from 'aws-lambda';
import { PutEventsCommand, PutEventsCommandInput } from '@aws-sdk/client-eventbridge';
import { PutEventsRequestEntry } from 'aws-sdk/clients/eventbridge';
import errorFormatter from '../utils/errorFormatter';
import EBClient from '../awsClients/eventBridgeClient';
import { DynamoStreamTypes, Entities } from '../Config';
import { env } from '../env';
import { AllEntities } from '../types/dynamo';

const processor = require('dynamodb-streams-processor');

export interface CustomEventBridgeEvent {
  eventName: DynamoStreamTypes;
  OldImage: AllEntities;
  NewImage: AllEntities;
  PK: string;
  SK: string;
  entityType: Entities;
  orgId: string;
}

export const main = async (event: DynamoDBStreamEvent) => {
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
    EventBusName: `${env.deploymentEnvironment}-EventBus`,
    DetailType: 'stream',
    Detail: JSON.stringify({
      eventName,
      OldImage,
      NewImage,
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
};
