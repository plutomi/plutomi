import { UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { Dynamo } from '../../awsClients/ddbDocClient';
import { DYNAMO_TABLE_NAME, Entities } from '../../Config';
import { APIUpdateStageOptions } from '../../Controllers/Stages/updateStage';
import { env } from '../../env';
import { DynamoStage } from '../../types/dynamo';
import { createDynamoUpdateExpression } from '../../utils/createDynamoUpdateExpression';

export interface UpdateStageInput extends Pick<DynamoStage, 'orgId' | 'stageId' | 'openingId'> {
  updatedValues: APIUpdateStageOptions;
}

export const updateStage = async (props: UpdateStageInput): Promise<[null, null] | [null, any]> => {
  const { orgId, stageId, updatedValues, openingId } = props;

  const { allUpdateExpressions, allAttributeValues } = createDynamoUpdateExpression({
    updatedValues,
  });

  const params = {
    Key: {
      PK: `${Entities.ORG}#${orgId}#${Entities.OPENING}#${openingId}#${Entities.STAGE}#${stageId}`,
      SK: Entities.STAGE,
    },
    UpdateExpression: `SET ${allUpdateExpressions.join(', ')}`,
    ExpressionAttributeValues: allAttributeValues,
    TableName: `${env.deploymentEnvironment}-${DYNAMO_TABLE_NAME}`,

    ConditionExpression: 'attribute_exists(PK)',
  };

  try {
    await Dynamo.send(new UpdateCommand(params));
    return [null, null];
  } catch (error) {
    return [null, error];
  }
};
