import {
  TransactWriteCommandInput,
  TransactWriteCommand,
} from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../AWSClients/ddbDocClient";
import { DYNAMO_TABLE_NAME, ENTITY_TYPES } from "../../Config";
import { DeleteStageInput } from "../../types/main";
import { SdkError } from "@aws-sdk/types";

export default async function DeleteStage(
  props: DeleteStageInput
): Promise<[null, null] | [null, SdkError]> {
  // TODO check if stage is empt of appliants first

  const { orgId, stageId, openingId, deleteIndex } = props;
  const transactParams: TransactWriteCommandInput = {
    TransactItems: [
      {
        // Delete stage
        Delete: {
          Key: {
            PK: `${ENTITY_TYPES.ORG}#${orgId}#${ENTITY_TYPES.OPENING}#${openingId}#${ENTITY_TYPES.STAGE}#${stageId}`,
            SK: ENTITY_TYPES.STAGE,
          },
          TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,
          ConditionExpression: "attribute_exists(PK)",
        },
      },

      // Remove the stage from the opening and decrement the stage count on the opening
      {
        Update: {
          Key: {
            PK: `${ENTITY_TYPES.ORG}#${orgId}#${ENTITY_TYPES.OPENING}#${openingId}`,
            SK: ENTITY_TYPES.OPENING,
          },
          TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,
          UpdateExpression: `REMOVE stageOrder[${deleteIndex}] SET totalStages = totalStages - :value`,
          ExpressionAttributeValues: {
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
