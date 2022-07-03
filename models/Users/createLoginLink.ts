import { PutCommandInput, PutCommand } from '@aws-sdk/lib-dynamodb';
import { nanoid } from 'nanoid';

import { Dynamo } from '../../awsClients/ddbDocClient';
import { DYNAMO_TABLE_NAME, Entities, TIME_UNITS } from '../../Config';
import { DynamoLoginLink, DynamoUser } from '../../types/dynamo';
import * as Time from '../../utils/time';

interface CreateLoginLinkInput extends Pick<DynamoLoginLink, 'user'> {
  loginLinkId: string;
  ttlExpiry: number; // Unix timestamp for TTL
}

export const createLoginLink = async (
  props: CreateLoginLinkInput,
): Promise<[null, null] | [null, any]> => {
  const { user, ttlExpiry, loginLinkId } = props;
  const now = Time.currentISO();
  try {
    const newLoginLink: DynamoLoginLink = {
      PK: `${Entities.USER}#${user.userId}`,
      SK: `${Entities.LOGIN_LINK}#${loginLinkId}`,
      user,
      entityType: Entities.LOGIN_LINK,
      createdAt: now,
      updatedAt: now,
      ttlExpiry,
      GSI1PK: `${Entities.USER}#${user.userId}#${Entities.LOGIN_LINK}S`, // To be able to get the latest login link(s) for a user for throttling
      GSI1SK: now,
    };

    const params: PutCommandInput = {
      TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,
      Item: newLoginLink,
      ConditionExpression: 'attribute_not_exists(PK)',
    };

    await Dynamo.send(new PutCommand(params));
    return [null, null];
  } catch (error) {
    return [null, error];
  }
};
