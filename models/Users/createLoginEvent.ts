import { TransactWriteCommandInput, TransactWriteCommand } from '@aws-sdk/lib-dynamodb';

import { RetentionDays } from '@aws-cdk/aws-logs';
import { Dynamo } from '../../awsClients/ddbDocClient';
import { Entities, DEFAULTS, TIME_UNITS, DYNAMO_TABLE_NAME } from '../../Config';
import { DynamoUserLoginEvent, DynamoUser, DynamoOrgLoginEvent } from '../../types/dynamo';
import * as Time from '../../utils/time';

interface CreateLoginEventAndDeleteLoginLinkInput {
  loginLinkId: string;
  user: DynamoUser;
}

export const createLoginEvent = async (
  props: CreateLoginEventAndDeleteLoginLinkInput,
): Promise<[null, null] | [null, any]> => {
  const { loginLinkId, user } = props;

  const now = Time.currentISO();

  const newUserLoginEvent: DynamoUserLoginEvent = {
    PK: `${Entities.USER}#${user.userId}`,
    SK: `${Entities.LOGIN_EVENT}#${now}`,
    user,
    entityType: Entities.LOGIN_EVENT,
    // TODO in the future, get more the info about the login event such as IP, headers, device, etc.
    createdAt: now,
    ttlExpiry: Time.futureUNIX(RetentionDays.ONE_WEEK, TIME_UNITS.DAYS),
  };

  const newOrgLoginEvent: DynamoOrgLoginEvent = {
    PK: `${Entities.ORG}#${user.orgId}`,
    SK: `${Entities.LOGIN_EVENT}#${now}`,
    // TODO user info here
    // TODO in the future, get more the info about the login event such as IP, headers, device, etc.
    createdAt: now,
    ttlExpiry: Time.futureUNIX(RetentionDays.ONE_WEEK, TIME_UNITS.DAYS),
  };

  try {
    const transactParams: TransactWriteCommandInput = {
      TransactItems: [
        {
          // Create a login event on the user
          Put: {
            Item: newUserLoginEvent,
            TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,
            ConditionExpression: 'attribute_not_exists(PK)',
          },
        },

        {
          // Delete the link used to login
          Delete: {
            Key: {
              PK: `${Entities.USER}#${user.userId}`,
              SK: `${Entities.LOGIN_LINK}#${loginLinkId}`,
            },
            TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,
            ConditionExpression: 'attribute_exists(PK)', // Link MUST exist!!!
          },
        },
      ],
    };
    // If a user has an orgId, create a login event on the org as well
    if (user.orgId !== DEFAULTS.NO_ORG) {
      transactParams.TransactItems.push({
        // Create a login event on the org
        Put: {
          Item: newOrgLoginEvent,
          TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,
          ConditionExpression: 'attribute_not_exists(PK)',
        },
      });
    }

    await Dynamo.send(new TransactWriteCommand(transactParams));
    return [null, null];
  } catch (error) {
    return [null, error];
  }
};
