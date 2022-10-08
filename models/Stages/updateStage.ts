import {
  TransactWriteCommand,
  TransactWriteCommandInput,
  UpdateCommand,
  UpdateCommandInput,
} from '@aws-sdk/lib-dynamodb';
import { Dynamo } from '../../awsClients/ddbDocClient';
import { DYNAMO_TABLE_NAME, Entities, NO_STAGE } from '../../Config';
import { APIUpdateStageOptions } from '../../Controllers/Stages/updateStage';
import { DynamoStage } from '../../types/dynamo';
import { createDynamoUpdateExpression } from '../../utils/createDynamoUpdateExpression';

export interface UpdateStageInput
  extends Pick<DynamoStage, 'orgId' | 'stageId' | 'openingId' | 'nextStageId' | 'previousStageId'> {
  updatedValues: APIUpdateStageOptions;
}

export const updateStage = async (props: UpdateStageInput): Promise<[null, null] | [null, any]> => {
  const {
    orgId,
    stageId,
    updatedValues,
    openingId,
    nextStageId: oldNextStageId,
    previousStageId: oldPreviousStageId,
  } = props;

  const { allUpdateExpressions, allAttributeValues } = createDynamoUpdateExpression({
    updatedValues,
  });

  const updateOperations: UpdateCommandInput[] = [];

  // TODO: Move this to a transaction eventually... :/
  // This is stupid inefficient but were migrating off of this piece of trash anyway
  const firstParams: UpdateCommandInput = {
    Key: {
      PK: `${Entities.ORG}#${orgId}#${Entities.OPENING}#${openingId}#${Entities.STAGE}#${stageId}`,
      SK: Entities.STAGE,
    },
    UpdateExpression: `SET ${allUpdateExpressions.join(', ')}`,
    ExpressionAttributeValues: allAttributeValues,
    TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,
    ConditionExpression: 'attribute_exists(PK)',
  };

  updateOperations.push(firstParams);

  const newNextStageExists = updatedValues.nextStageId !== NO_STAGE;
  const newPreviousStageExists = updatedValues.previousStageId !== NO_STAGE;
  const oldPreviousStageExists = oldPreviousStageId !== NO_STAGE;
  const oldNextStageExists = oldNextStageId !== NO_STAGE;

  if (newNextStageExists) {
    const param1: UpdateCommandInput = {
      Key: {
        PK: `${Entities.ORG}#${orgId}#${Entities.OPENING}#${openingId}#${Entities.STAGE}#${updatedValues.nextStageId}`,
        SK: Entities.STAGE,
      },
      UpdateExpression: `SET previousStageId = :previousStageId`,
      ExpressionAttributeValues: {
        ':previousStageId': stageId,
      },
      TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,
    };
    updateOperations.push(param1);
  }
  if (newPreviousStageExists) {
    const param1: UpdateCommandInput = {
      Key: {
        PK: `${Entities.ORG}#${orgId}#${Entities.OPENING}#${openingId}#${Entities.STAGE}#${updatedValues.previousStageId}`,
        SK: Entities.STAGE,
      },
      UpdateExpression: `SET nextStageId = :nextStageId`,
      ExpressionAttributeValues: {
        ':nextStageId': stageId,
      },
      TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,
    };
    updateOperations.push(param1);
  }

  if (oldPreviousStageExists) {
    const param1: UpdateCommandInput = {
      Key: {
        PK: `${Entities.ORG}#${orgId}#${Entities.OPENING}#${openingId}#${Entities.STAGE}#${oldPreviousStageExists}`,
        SK: Entities.STAGE,
      },
      UpdateExpression: `SET nextStageId = :nextStageId`,
      ExpressionAttributeValues: {
        ':nextStageId': oldNextStageId,
      },
      TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,
    };
    updateOperations.push(param1);
  }

  if (oldNextStageExists) {
    const param1: UpdateCommandInput = {
      Key: {
        PK: `${Entities.ORG}#${orgId}#${Entities.OPENING}#${openingId}#${Entities.STAGE}#${oldNextStageId}`,
        SK: Entities.STAGE,
      },
      UpdateExpression: `SET previousStageId = :previousStageId`,
      ExpressionAttributeValues: {
        ':previousStageId': oldPreviousStageId,
      },
      TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,
    };
    updateOperations.push(param1);
  }

  let response = [null, null];
  let errors = [];
  await Promise.all(
    updateOperations.map(async (params) => {
      console.log(`Attempting to update `, params);
      try {
        await Dynamo.send(new UpdateCommand(params));
        console.log(`Updated properly!`);
      } catch (error) {
        console.error(`An error ocurred updating params`, params);
        errors.push({
          params,
          error,
        });
        response = [null, { message: 'An error ocurred updating params', errors }];
      }
    }),
  );

  // SIGHJGHHHHHHHHHHHHHHH TODO
  return response as unknown as Promise<[null, null] | [null, any]
};
