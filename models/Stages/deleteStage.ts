// TODO check if stage is empt of appliants first

import {
  TransactWriteCommandInput,
  TransactWriteCommand,
} from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../awsClients/ddbDocClient";
import { ENTITY_TYPES } from "../../Config";
import { DeleteStageInput } from "../../types/main";
const { DYNAMO_TABLE_NAME } = process.env;
import { SdkError } from "@aws-sdk/types";
export default async function Remove(
  props: DeleteStageInput
): Promise<[null, null] | [null, SdkError]> {
  const { orgId, stageId, openingId, nextStage, previousStage } = props;

  const transactParams: TransactWriteCommandInput = {
    TransactItems: [
      {
        // Delete stage
        Delete: {
          Key: {
            PK: `${ENTITY_TYPES.ORG}#${orgId}#${ENTITY_TYPES.OPENING}#${openingId}#${ENTITY_TYPES.STAGE}#${stageId}`,
            SK: ENTITY_TYPES.STAGE,
          },
          TableName: DYNAMO_TABLE_NAME,
          ConditionExpression: "attribute_exists(PK)",
        },
      },

      {
        // Decrement stage count on org
        Update: {
          Key: {
            PK: `${ENTITY_TYPES.ORG}#${orgId}`,
            SK: ENTITY_TYPES.ORG,
          },
          TableName: DYNAMO_TABLE_NAME,
          UpdateExpression: "SET totalStages = totalStages - :value",
          ExpressionAttributeValues: {
            ":value": 1,
          },
          ConditionExpression: "attribute_exists(PK)",
        },
      },
    ],
  };

  // If the stage that is about to be deleted had a stage before it,
  // set the nextStage attribute of that stage to the one the deleted stage had
  if (previousStage) {
    const statement = {
      Update: {
        Key: {
          PK: `${ENTITY_TYPES.ORG}#${orgId}#${ENTITY_TYPES.OPENING}#${openingId}#${ENTITY_TYPES.STAGE}#${previousStage}`,
          SK: ENTITY_TYPES.STAGE,
        },
        TableName: DYNAMO_TABLE_NAME,
        UpdateExpression: "SET nextStage = :value",
        ExpressionAttributeValues: {
          ":value": nextStage,
        },
      },
    };

    transactParams.TransactItems.push(statement);
  }

  /**
   * If a nextStage is provided, the stage being created goes BEFORE it.
   * Update the next stage's previousStage property with the stage being created
   */
  if (nextStage) {
    const statement = {
      Update: {
        Key: {
          PK: `${ENTITY_TYPES.ORG}#${orgId}#${ENTITY_TYPES.OPENING}#${openingId}#${ENTITY_TYPES.STAGE}#${nextStage}`,
          SK: ENTITY_TYPES.STAGE,
        },
        TableName: DYNAMO_TABLE_NAME,

        UpdateExpression: "SET previousStage = :value",
        ExpressionAttributeValues: {
          ":value": previousStage,
        },
      },
    };

    transactParams.TransactItems.push(statement);
  }

  try {
    await Dynamo.send(new TransactWriteCommand(transactParams));
    // TODO Qeuery all items that start with PK: stageId & SK: ${ENTITY_TYPES.STAGE}
    // Maybe background processes can handle this instead
    return [null, null];
  } catch (error) {
    return [null, error];
  }
}
