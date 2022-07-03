import { EventBridgeEvent } from 'aws-lambda';
import axios from 'axios';
import { DynamoStreamTypes, Entities } from '../Config';
import {
  DynamoApplicant,
  DynamoLoginLink,
  DynamoOrgLoginEvent,
  DynamoUser,
  DynamoUserLoginEvent,
} from '../types/dynamo';
import { DB } from '../models';
import { CustomEventBridgeEvent } from './stream-processor';

export async function main(event: EventBridgeEvent<'stream', CustomEventBridgeEvent>) {
  // New user logging in for the first time
  if (
    event.detail.NewImage.entityType === Entities.USER_LOGIN_EVENT &&
    !event.detail.NewImage.user.verifiedEmail
  ) {
    const { user } = event.detail.NewImage;

    // TODO send admin email
    // TODO send user welcome email
  }
}
