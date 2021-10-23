import { DeleteCommand, DeleteCommandInput } from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../libs/ddbDocClient";
const { DYNAMO_TABLE_NAME } = process.env;
import { DeleteStage } from "../stages/deleteStage";
import { GetAllStagesInOpening } from "../stages/getAllStagesInOpening";
// TODO check if stage is empt of appliants first
// TODO delete stage from the funnels sort order
export async function DeleteOpening({ org_id, opening_id }) {
  const all_stages = await GetAllStagesInOpening(org_id, opening_id);

  const params = {
    TableName: DYNAMO_TABLE_NAME,
    Key: {
      PK: `ORG#${org_id}#OPENING#${opening_id}`,
      SK: `OPENING`,
    },
  };

  try {
    // Delete
    if (all_stages.length > 0) {
      console.log(`Deleting ${all_stages.length} stages`);
      all_stages.map(async (stage: DynamoStage) => {
        const input = {
          org_id: org_id,
          opening_id: opening_id,
          stage_id: stage.stage_id,
        };
        await DeleteStage(input);
      });
    }

    console.log("Deleting funnel");
    await Dynamo.send(new DeleteCommand(params));
    return;
  } catch (error) {
    throw new Error(error);
  }
}
