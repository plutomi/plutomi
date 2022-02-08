import {
  TransactWriteCommandInput,
  TransactWriteCommand,
} from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../AWSClients/ddbDocClient";
import { ENTITY_TYPES } from "../../Config";
const { DYNAMO_TABLE_NAME } = process.env;
import { SdkError } from "@aws-sdk/types";
import { DeleteQuestionFromStageInput } from "../../types/main";

export default async function DeleteQuestionFromStage(
  props: DeleteQuestionFromStageInput
): Promise<[null, null] | [null, SdkError]> {
  const {
    orgId,
    openingId,
    stageId,
    questionId,
    deleteIndex,
    decrementStageCount,
  } = props;

  let transactParams: TransactWriteCommandInput = {
    TransactItems: [
      {
        // Delete the adjacent item
        Delete: {
          Key: {
            PK: `${ENTITY_TYPES.ORG}#${orgId}#${ENTITY_TYPES.QUESTION}#${questionId}#${ENTITY_TYPES.STAGE}S`,
            SK: `${ENTITY_TYPES.OPENING}#${openingId}#${ENTITY_TYPES.STAGE}#${stageId}`,
          },
          TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,
          ConditionExpression: "attribute_exists(PK)",
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
          UpdateExpression: `REMOVE questionOrder[${deleteIndex}]`,
        },
      },
    ],
  };

  // Not needed if the question has been deleted from the org and we just need
  // to remove it from being used in the stages
  if (decrementStageCount) {
    transactParams.TransactItems.push({
      // Decrement the totalStages count on the question
      Update: {
        Key: {
          PK: `${ENTITY_TYPES.ORG}#${orgId}#${ENTITY_TYPES.QUESTION}#${questionId}`,
          SK: ENTITY_TYPES.QUESTION,
        },
        TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,
        UpdateExpression: "SET totalStages = totalStages - :value",
        ExpressionAttributeValues: {
          ":value": 1,
        },
      },
    });
  }

  console.log("Transaction params", JSON.stringify(transactParams));
  try {
    await Dynamo.send(new TransactWriteCommand(transactParams));
    return [null, null];
  } catch (error) {
    return [null, error];
  }
}
