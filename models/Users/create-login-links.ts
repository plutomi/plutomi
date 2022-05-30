import { PutCommandInput, PutCommand } from '@aws-sdk/lib-dynamodb';
import { SdkError } from '@aws-sdk/types';
import { Dynamo } from '../../awsClients/ddbDocClient';
import { DYNAMO_TABLE_NAME, Entities, TIME_UNITS } from '../../Config';
import { DynamoLoginLink } from '../../types/dynamo';
import { CreateLoginLinkInput } from '../../types/main';
import * as Time from '../../utils/time';

/**
 * Creates a login link for the requested user
 * @param props {@link CreateLoginLinkInput}
 * @returns
 */
export default async function CreateLoginLink(
  props: CreateLoginLinkInput,
): Promise<[null, null] | [null, SdkError]> {
  const { loginLinkId, loginLinkUrl, loginLinkExpiry, user } = props;
  const now = Time.currentISO();
  try {
    const newLoginLink: DynamoLoginLink = {
      PK: `${Entities.USER}#${user.userId}`,
      SK: `${Entities.LOGIN_LINK}#${loginLinkId}`,
      loginLinkUrl,
      relativeExpiry: Time.relative(new Date(loginLinkExpiry)),
      user,
      entityType: Entities.LOGIN_LINK,
      createdAt: now,
      ttlExpiry: Time.futureUNIX(15, TIME_UNITS.MINUTES),
      GSI1PK: `${Entities.USER}#${user.userId}#${Entities.LOGIN_LINK}S`, // Get latest login link(s) for a user for throttling
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
}
