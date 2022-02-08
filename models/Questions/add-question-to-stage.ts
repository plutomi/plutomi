import {
  TransactWriteCommandInput,
  TransactWriteCommand,
} from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../AWSClients/ddbDocClient";
import { ENTITY_TYPES } from "../../Config";
import * as Time from "../../utils/time";
const { DYNAMO_TABLE_NAME } = process.env;
import { SdkError } from "@aws-sdk/types";
import { AddQuestionToStageInput } from "../../types/main";

/**
 * Updates the questionOrder on the stage and creates another item
 * so that when the question is deleted, we can recursively
 * get all stages that had this question and update them as well
 */

export default async function AddQuestionToStage(
  props: AddQuestionToStageInput
): Promise<[null, null] | [null, SdkError]> {
  const { orgId, openingId, stageId, questionId, questionOrder } = props;

  const params = {
    PK: `${ENTITY_TYPES.ORG}#${orgId}#${ENTITY_TYPES.QUESTION}#${questionId}#${ENTITY_TYPES.STAGE}S`,
    SK: `${ENTITY_TYPES.OPENING}#${openingId}#${ENTITY_TYPES.STAGE}#${stageId}`,
    entityType: ENTITY_TYPES.QUESTION,
    createdAt: Time.currentISO(),
    orgId,
    openingId,
    stageId,
    questionId,
  };

  const transactParams: TransactWriteCommandInput = {
    TransactItems: [
      {
        // Create the adjacent item
        Put: {
          Item: params,
          TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,
          // This should never conflict because we check
          // that a stage doesn't already have a question by this ID
          ConditionExpression: "attribute_not_exists(PK)",
        },
      },
      {
        /**
         * If adding many questions to a stage,
         * there is a chance that the transaction will fail, make sure to wait in between each call
         * { Code: 'TransactionConflict',
         * Item: undefined,
         * Message: 'Transaction is ongoing for the item'}
         */
        Update: {
          Key: {
            PK: `${ENTITY_TYPES.ORG}#${orgId}#${ENTITY_TYPES.OPENING}#${openingId}#${ENTITY_TYPES.STAGE}#${stageId}`,
            SK: ENTITY_TYPES.STAGE,
          },
          TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,
          UpdateExpression: "SET questionOrder = :questionOrder",
          ExpressionAttributeValues: {
            ":questionOrder": questionOrder,
          },
        },
      },
      {
        // Update the totalStages count on the question
        Update: {
          Key: {
            PK: `${ENTITY_TYPES.ORG}#${orgId}#${ENTITY_TYPES.QUESTION}#${questionId}`,
            SK: ENTITY_TYPES.QUESTION,
          },
          TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,
          UpdateExpression:
            "SET totalStages = if_not_exists(totalStages, :zero) + :value",
          ExpressionAttributeValues: {
            ":zero": 0,
            ":value": 1,
          },
        },
      },
    ],
  };

  try {
    await Dynamo.send(new TransactWriteCommand(transactParams));
    return [null, null];
  } catch (error) {
    return [null, error];
  }
}
