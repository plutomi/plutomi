import {
  TransactWriteCommand,
  TransactWriteCommandInput,
} from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../lib/awsClients/ddbDocClient";
import { GetOpening } from "../openings/getOpeningById";
import { GetStage } from "./getStage";
const { DYNAMO_TABLE_NAME } = process.env;
// TODO check if stage is empt of appliants first
// TODO delete stage from the funnels sort order
export async function DeleteStage({ org_id, stageId }: DeleteStageInput) {
  // TODO Qeuery all items that start with PK: stageId & SK: STAGE
  // Get the opening we need to update
  try {
    let stage = await GetStage({ org_id, stageId });
    let opening = await GetOpening({
      org_id: org_id,
      openingId: stage.openingId,
    });

    // Set the new stage order
    let new_stage_order = opening.stage_order.filter(
      (id: string) => id !== stageId
    );
    opening.stage_order = new_stage_order;

    // Delete the stage item & update the stage order on the opening
    const transactParams: TransactWriteCommandInput = {
      TransactItems: [
        {
          // Delete stage
          Delete: {
            Key: {
              PK: `ORG#${org_id}#STAGE#${stageId}`,
              SK: `STAGE`,
            },
            TableName: DYNAMO_TABLE_NAME,
          },
        },
        {
          // Update Stage Order
          Update: {
            Key: {
              PK: `ORG#${org_id}#OPENING#${opening.openingId}`,
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
              PK: `ORG#${org_id}`,
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
