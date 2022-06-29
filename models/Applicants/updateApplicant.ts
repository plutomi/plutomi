import { UpdateCommandInput, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { Dynamo } from '../../awsClients/ddbDocClient';
import { DYNAMO_TABLE_NAME, Entities } from '../../Config';
import { DynamoApplicant } from '../../types/dynamo';
import { createDynamoUpdateExpression } from '../../utils/createDynamoUpdateExpression';

export interface UpdateDynamoApplicantInput extends Pick<DynamoApplicant, 'orgId' | 'applicantId'> {
  updatedValues: { [key: string]: any }; // TODO
}

// TODO new udpate method https://github.com/plutomi/plutomi/issues/594
export const updateApplicant = async (
  props: UpdateDynamoApplicantInput,
): Promise<[null, null] | [null, any]> => {
  const { orgId, applicantId, updatedValues } = props;

  const { allUpdateExpressions, allAttributeValues } = createDynamoUpdateExpression({
    updatedValues,
  });
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
    return [null, null];
  } catch (error) {
    return [null, error];
  }
};
