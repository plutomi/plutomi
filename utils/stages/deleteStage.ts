import {
  TransactWriteCommand,
  TransactWriteCommandInput,
} from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../awsClients/ddbDocClient";
import { getOpening } from "../openings/getOpeningById";
import { getStageById } from "./getStageById";
const { DYNAMO_TABLE_NAME } = process.env;
// TODO check if stage is empt of appliants first
// TODO delete stage from the funnels sort order
export async function deleteStage(props: DeleteStageInput): Promise<void> {
  const { orgId, stageId } = props;
  // TODO Qeuery all items that start with PK: stageId & SK: STAGE
  // Get the opening we need to update
  try {
    let stage = await getStageById({ orgId, stageId });
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
              PK: `ORG#${orgId}#STAGE#${stageId}`,
              SK: `STAGE`,
            },
            TableName: DYNAMO_TABLE_NAME,
          },
        },
        {
          // Update Stage Order
          Update: {
            Key: {
              PK: `ORG#${orgId}#OPENING#${opening.openingId}`,
              SK: `OPENING`,
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
              PK: `ORG#${orgId}`,
              SK: `ORG`,
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
      // TODO Qeuery all items that start with PK: stageId & SK: STAGE
      // Maybe background processes can handle this instead
      return;
    } catch (error) {
      throw new Error(error);
    }
  } catch (error) {
    console.error(error);
    throw Error(`Unable to retrieve opening to delete stage ${error}`);
  }
}
