import { DeleteCommand, DeleteCommandInput } from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../libs/ddbDocClient";
const { DYNAMO_TABLE_NAME } = process.env;
import { GetStageById } from "../stages/getStageById";
import UpdateStage from "../stages/updateStage";

export async function DeleteQuestionInStage({
  org_id,
  opening_id,
  stage_id,
  question_id,
}: DeleteQuestionInput) {
  const params: DeleteCommandInput = {
    TableName: DYNAMO_TABLE_NAME,
    Key: {
      PK: `ORG#${org_id}#OPENING#${opening_id}#STAGE#${stage_id}`,
      SK: `STAGE_QUESTION#${question_id}`,
    },
  };

  try {
    // TODO this should be a transaction
    await Dynamo.send(new DeleteCommand(params));

    let stage = await GetStageById({ org_id, opening_id, stage_id });
    const deleted_question_index = stage.question_order.indexOf(question_id);
    if (deleted_question_index < 0) {
      throw new Error(
        `It appears this question doesn't exist anymore, someone else might have deleted it recently`
      );
    }
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
