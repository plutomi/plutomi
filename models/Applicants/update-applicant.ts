import { UpdateCommandInput, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { SdkError } from '@aws-sdk/types';
import { Dynamo } from '../../AWSClients/ddbDocClient';
import { DYNAMO_TABLE_NAME, ENTITY_TYPES } from '../../Config';
import { UpdateApplicantInput } from '../../types/main';

export default async function UpdateApplicant(
  props: UpdateApplicantInput,
): Promise<[null, null] | [null, SdkError]> {
  const { orgId, applicantId, newValues } = props;

  // Build update expression
  const allUpdateExpressions: string[] = [];
  const allAttributeValues: { [key: string]: string } = {};

  // Filter out forbidden property
  for (const property of Object.keys(newValues)) {
    // Push each property into the update expression
    allUpdateExpressions.push(`${property} = :${property}`);

    // Create values for each attribute
    allAttributeValues[`:${property}`] = newValues[property];
  }

  const params: UpdateCommandInput = {
    Key: {
      PK: `${ENTITY_TYPES.ORG}#${orgId}#${ENTITY_TYPES.APPLICANT}#${applicantId}`,
      SK: ENTITY_TYPES.APPLICANT,
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
}
