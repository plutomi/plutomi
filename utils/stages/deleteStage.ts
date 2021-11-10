import {
  TransactWriteCommand,
  TransactWriteCommandInput,
} from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../lib/awsClients/ddbDocClient";
import { GetOpening } from "../openings/getOpeningById";
import { getStage } from "./getStage";
const { DYNAMO_TABLE_NAME } = process.env;
// TODO check if stage is empt of appliants first
// TODO delete stage from the funnels sort order
export async function DeleteStage({ orgId, stage_id }: DeleteStageInput) {
  // TODO Qeuery all items that start with PK: stage_id & SK: STAGE
  // Get the opening we need to update
  try {
    let stage = await getStage({ orgId, stage_id });
    let opening = await GetOpening({
      orgId: orgId,
      opening_id: stage.opening_id,
    });

    // Set the new stage order
    let new_stage_order = opening.stage_order.filter(
      (id: string) => id !== stage_id
    );
    opening.stage_order = new_stage_order;

    // Delete the stage item & update the stage order on the opening
    const transactParams: TransactWriteCommandInput = {
      TransactItems: [
        {
          // Delete stage
          Delete: {
            Key: {
              PK: `ORG#${orgId}#STAGE#${stage_id}`,
              SK: `STAGE`,
            },
            TableName: DYNAMO_TABLE_NAME,
          },
        },
        {
          // Update Stage Order
          Update: {
            Key: {
              PK: `ORG#${orgId}#OPENING#${opening.opening_id}`,
              SK: `OPENING`,
            },
            TableName: DYNAMO_TABLE_NAME,
            ConditionExpression: "attribute_exists(PK)",
            UpdateExpression: "SET stage_order = :stage_order",
            ExpressionAttributeValues: {
              ":stage_order": opening.stage_order,
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
            UpdateExpression: "SET total_stages = total_stages - :value",
            ExpressionAttributeValues: {
              ":value": 1,
            },
          },
        },
      ],
    };

    try {
      await Dynamo.send(new TransactWriteCommand(transactParams));
      // TODO Qeuery all items that start with PK: stage_id & SK: STAGE
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
