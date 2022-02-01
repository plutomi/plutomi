import {
  TransactWriteCommandInput,
  TransactWriteCommand,
} from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../AWSClients/ddbDocClient";
import { ENTITY_TYPES } from "../../Config";
import { DynamoNewOpening, DynamoNewStage } from "../../types/dynamo";
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
): Promise<[DynamoNewOpening, null] | [null, SdkError]> {
  const { orgId, openingId, stageId, questionId, questionOrder } = props;
  const params = {
    PK: `${ENTITY_TYPES.ORG}#${orgId}#${ENTITY_TYPES.QUESTION}#${questionId}#${ENTITY_TYPES.STAGE}S`,
    SK: `${ENTITY_TYPES.OPENING}#${openingId}#${ENTITY_TYPES.STAGE}#${stageId}`,
    entityType: ENTITY_TYPES.QUESTION,
    createdAt: Time.currentISO(),
    orgId,
    openingId,
    stageId,
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
        // Update the question order on the stage
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
    ],
  };

  try {
    await Dynamo.send(new TransactWriteCommand(transactParams));
    return [null, null];
  } catch (error) {
    return [null, error];
  }
}
