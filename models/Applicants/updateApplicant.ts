import { UpdateCommandInput, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { SdkError } from '@aws-sdk/types';
import { Dynamo } from '../../awsClients/ddbDocClient';
import { DYNAMO_TABLE_NAME, Entities } from '../../Config';
import { DynamoApplicant } from '../../types/dynamo';

export interface UpdateDynamoApplicantInput extends Pick<DynamoApplicant, 'orgId' | 'applicantId'> {
  newValues: { [key: string]: any };
}

// TODO new udpate method https://github.com/plutomi/plutomi/issues/594
export const updateApplicant = async (
  props: UpdateDynamoApplicantInput,
): Promise<[undefined, undefined] | [undefined, SdkError]> => {
  const { orgId, applicantId, newValues } = props;
  // Build update expression
  const allUpdateExpressions: string[] = [];
  const allAttributeValues: { [key: string]: string } = {};

  // https://github.com/plutomi/plutomi/issues/594
  // eslint-disable-next-line no-restricted-syntax
  for (const property of Object.keys(newValues)) {
    // Push each property into the update expression
    allUpdateExpressions.push(`${property} = :${property}`);

    // Create values for each attribute
    allAttributeValues[`:${property}`] = newValues[property];
  }

  const params: UpdateCommandInput = {
    Key: {
      PK: `${Entities.ORG}#${orgId}#${Entities.APPLICANT}#${applicantId}`,
      SK: Entities.APPLICANT,
    },
    UpdateExpression: `SET ${allUpdateExpressions.join(', ')}`,
    ExpressionAttributeValues: allAttributeValues,
    TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,

    ConditionExpression: 'attribute_exists(PK)',
  };

  try {
    await Dynamo.send(new UpdateCommand(params));
    return [undefined, undefined];
  } catch (error) {
    return [undefined, error];
  }
};
