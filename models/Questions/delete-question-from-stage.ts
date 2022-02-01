import {
  TransactWriteCommandInput,
  TransactWriteCommand,
} from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../AWSClients/ddbDocClient";
import { ENTITY_TYPES } from "../../Config";
const { DYNAMO_TABLE_NAME } = process.env;
import { SdkError } from "@aws-sdk/types";
import { AddQuestionToStageInput } from "../../types/main";

export default async function DeleteQuestionFromStage(
  props: AddQuestionToStageInput
): Promise<[null, null] | [null, SdkError]> {
  const { orgId, openingId, stageId, questionId, questionOrder } = props;

  const transactParams: TransactWriteCommandInput = {
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
