import { PutCommandInput, PutCommand } from '@aws-sdk/lib-dynamodb';
import { nanoid } from 'nanoid';

import { Dynamo } from '../../awsClients/ddbDocClient';
import { ID_LENGTHS, Entities, DEFAULTS, DYNAMO_TABLE_NAME } from '../../Config';
import { DynamoUser } from '../../types/dynamo';
import * as Time from '../../utils/time';

interface CreateUserInput {
  email: string;
  firstName?: string;
  lastName?: string;
}

export const createUser = async (
  props: CreateUserInput,
): Promise<[DynamoUser, null] | [null, any]> => {
  const { email, firstName, lastName } = props;
  const userId = nanoid(ID_LENGTHS.USER);
  const now = Time.currentISO();
  const newUser: DynamoUser = {
    PK: `${Entities.USER}#${userId}`,
    SK: Entities.USER,
    firstName: firstName || DEFAULTS.FIRST_NAME,
    lastName: lastName || DEFAULTS.LAST_NAME,
    email: email.toLowerCase().trim(),
    userId,
    entityType: Entities.USER,
    createdAt: now,
    updatedAt: now,
    orgId: DEFAULTS.NO_ORG,
    totalInvites: 0, // TODO when creating an invite, a user is created. We should set this to 1!
    orgJoinDate: DEFAULTS.NO_ORG,
    GSI1PK: `${Entities.ORG}#${DEFAULTS.NO_ORG}#${Entities.USER}S`,
    GSI1SK:
      firstName && lastName
        ? `${firstName} ${lastName}`
        : `${DEFAULTS.FIRST_NAME} ${DEFAULTS.LAST_NAME}`,
    GSI2PK: email.toLowerCase().trim(),
    GSI2SK: Entities.USER,
    unsubscribeKey: nanoid(10),
    canReceiveEmails: true,
    verifiedEmail: false,
  };
  const params: PutCommandInput = {
    TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,
    Item: newUser,
    ConditionExpression: 'attribute_not_exists(PK)',
  };

  try {
    await Dynamo.send(new PutCommand(params));
    return [newUser, null];
  } catch (error) {
    return [null, error];
  }
};
