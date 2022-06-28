/* eslint-disable no-restricted-syntax */
/* eslint-disable prefer-const */
import { UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { SdkError } from '@aws-sdk/types';
import { Dynamo } from '../../awsClients/ddbDocClient';
import { DYNAMO_TABLE_NAME, Entities } from '../../Config';
import { DynamoWebhook } from '../../types/dynamo';

export interface UpdateWebhookInput extends Pick<DynamoWebhook, 'orgId' | 'webhookId'> {
  newValues: { [key: string]: any };
}

// TODO new udpate method https://github.com/plutomi/plutomi/issues/594
export const updateWebhook = async (props: UpdateWebhookInput): Promise<[undefined, SdkError]> => {
  const { orgId, webhookId, newValues } = props;
  // Build update expression
  let allUpdateExpressions: string[] = [];
  let allAttributeValues: { [key: string]: string } = {};

  // eslint-disable-next-line guard-for-in
  for (const property in newValues) {
    // Push each property into the update expression
    allUpdateExpressions.push(`${property} = :${property}`);

    // Create values for each attribute
    allAttributeValues[`:${property}`] = newValues[property];
  }

  // TODO lots of eslint disabled up above
  const params = {
    Key: {
      PK: `${Entities.ORG}#${orgId}#${Entities.WEBHOOK}#${webhookId}`,
      SK: Entities.WEBHOOK,
    },
    UpdateExpression: `SET ${allUpdateExpressions.join(', ')}`,
    ExpressionAttributeValues: allAttributeValues,
    TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,
    ConditionExpression: 'attribute_exists(PK)',
  };

  try {
    await Dynamo.send(new UpdateCommand(params));
    return [null, null];
  } catch (error) {
    return [null, error];
  }
};
