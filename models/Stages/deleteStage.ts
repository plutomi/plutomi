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
  const { orgId, stageId, stageOrder, openingId } = props;
  // TODO Qeuery all items that start with PK: stageId & SK: ${ENTITY_TYPES.STAGE}

  // Set the new stage order
  let newStageOrder = stageOrder.filter((id: string) => id !== stageId);

  // Delete the stage item & update the stage order on the opening
  const transactParams: TransactWriteCommandInput = {
    TransactItems: [
      {
        // Delete stage
        Delete: {
          Key: {
            PK: `${ENTITY_TYPES.ORG}#${orgId}#${ENTITY_TYPES.STAGE}#${stageId}`,
            SK: ENTITY_TYPES.STAGE,
          },
          TableName: DYNAMO_TABLE_NAME,
        },
      },
      {
        // Update Stage Order & decrement count
        Update: {
          Key: {
            PK: `${ENTITY_TYPES.ORG}#${orgId}#${ENTITY_TYPES.OPENING}#${openingId}`,
            SK: ENTITY_TYPES.OPENING,
          },
          TableName: DYNAMO_TABLE_NAME,
          ConditionExpression: "attribute_exists(PK)",
          UpdateExpression:
            "SET stageOrder = :stageOrder, totalStages = totalStages - :value",
          ExpressionAttributeValues: {
            ":stageOrder": newStageOrder,
            ":value": 1,
          },
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
        },
      },
    ],
  };

  try {
    await Dynamo.send(new TransactWriteCommand(transactParams));
    // TODO Qeuery all items that start with PK: stageId & SK: ${ENTITY_TYPES.STAGE}
    // Maybe background processes can handle this instead
    return [null, null];
  } catch (error) {
    return [null, error];
  }
}
