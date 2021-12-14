// TODO check if stage is empt of appliants first

import {
  TransactWriteCommandInput,
  TransactWriteCommand,
} from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../awsClients/ddbDocClient";
import { ENTITY_TYPES } from "../../Config";
import { DeleteStageInput } from "../../types/main";
import getOpening from "../Openings/getOpening";
import { getStageById } from ".";
const { DYNAMO_TABLE_NAME } = process.env;

// TODO delete stage from the funnels sort order
export default async function Remove(
  props: DeleteStageInput
): Promise<[null, null] | [null, Error]> {
  const { orgId, stageId } = props;
  // TODO Qeuery all items that start with PK: stageId & SK: ${ENTITY_TYPES.STAGE}
  // Get the opening we need to update
  try {
    let stage = await getStageById({ orgId, stageId });
    // TODO this should not be here, this should be in controller
    let opening = await getOpening({
      orgId: orgId,
      openingId: stage.openingId,
    });

    // Set the new stage order
    let newStageOrder = opening.stageOrder.filter(
      (id: string) => id !== stageId
    );
    opening.stageOrder = newStageOrder;

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
          // Update Stage Order
          Update: {
            Key: {
              PK: `${ENTITY_TYPES.ORG}#${orgId}#${ENTITY_TYPES.OPENING}#${opening.openingId}`,
              SK: ENTITY_TYPES.OPENING,
            },
            TableName: DYNAMO_TABLE_NAME,
            ConditionExpression: "attribute_exists(PK)",
            UpdateExpression: "SET stageOrder = :stageOrder",
            ExpressionAttributeValues: {
              ":stageOrder": opening.stageOrder,
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
  } catch (error) {
    return [null, error];
  }
}
