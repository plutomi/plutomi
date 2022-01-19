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
  const { orgId, stageId, openingId } = props;

  const deletionStageIndex = props.stageOrder.indexOf(stageId);
  props.stageOrder.splice(deletionStageIndex, 1);
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

          UpdateExpression:
            "SET stageOrder = :stageOrder, totalStages = totalStages - :value",
          ExpressionAttributeValues: {
            ":stageOrder": props.stageOrder,
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
