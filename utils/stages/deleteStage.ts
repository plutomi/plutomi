import { DeleteCommand, DeleteCommandInput } from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../libs/ddbDocClient";
import { GetOpening } from "../openings/getOpeningById";
const { DYNAMO_TABLE_NAME } = process.env;
import UpdateOpening from "../openings/updateOpening";
// TODO check if stage is empt of appliants first
// TODO delete stage from the funnels sort order
export async function DeleteStage({
  org_id,
  opening_id,
  stage_id,
}: DeleteStageInput) {
  const params: DeleteCommandInput = {
    TableName: DYNAMO_TABLE_NAME,
    Key: {
      PK: `ORG#${org_id}#OPENING#${opening_id}#STAGE#${stage_id}`,
      SK: `STAGE`,
    },
  };

  try {
    await Dynamo.send(new DeleteCommand(params));

    let opening = await GetOpening({ org_id, opening_id });

    let new_stage_order = opening.stage_order.filter(
      (id: string) => id !== stage_id
    );
    opening.stage_order = new_stage_order;

    const update_opening_input = {
      org_id: org_id,
      opening_id: opening_id,
      updated_opening: opening,
    };

    await UpdateOpening(update_opening_input);
    return;
  } catch (error) {
    throw new Error(error);
  }
}
