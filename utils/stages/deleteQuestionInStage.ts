import { DeleteCommand, DeleteCommandInput } from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../libs/ddbDocClient";
import { GetOpening } from "../openings/getOpeningById";
const { DYNAMO_TABLE_NAME } = process.env;
import { GetStageById } from "./getStageById";
import UpdateStage from "./updateStage";
import UpdateOpening from "../openings/updateOpening";

export async function DeleteQuestionInStage({
  org_id,
  opening_id,
  stage_id,
  stage_question_id,
}: DeleteQuestionInput) {
  const params: DeleteCommandInput = {
    TableName: DYNAMO_TABLE_NAME,
    Key: {
      PK: `ORG#${org_id}#OPENING#${opening_id}#STAGE#${stage_id}`,
      SK: `STAGE_QUESTION#${stage_question_id}`,
    },
  };

  try {
    // TODO this should be a transaction
    await Dynamo.send(new DeleteCommand(params));

    let stage = await GetStageById({ org_id, opening_id, stage_id });
    const deleted_question_index =
      stage.question_order.indexOf(stage_question_id);
    // Update question order
    stage.question_order.splice(deleted_question_index, 1);

    const update_stage_input = {
      org_id: org_id,
      opening_id: opening_id,
      stage_id: stage_id,
      updated_stage: stage,
    };
    await UpdateStage(update_stage_input);

    return;
  } catch (error) {
    throw new Error(error);
  }
}
