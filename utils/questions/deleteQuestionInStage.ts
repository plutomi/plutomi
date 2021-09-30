import {
  DeleteCommand,
  DeleteCommandInput,
  TransactWriteCommand,
  TransactWriteCommandInput,
} from "@aws-sdk/lib-dynamodb";
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
  // Delete the question item & update the question order on the stage
  try {
    let stage = await GetStageById({ org_id, opening_id, stage_id });
    const deleted_question_index = stage.question_order.indexOf(question_id);

    // Update question order
    stage.question_order.splice(deleted_question_index, 1);

    const transactParams: TransactWriteCommandInput = {
      TransactItems: [
        {
          // Delete question
          Delete: {
            Key: {
              PK: `ORG#${org_id}#OPENING#${opening_id}#STAGE#${stage_id}`,
              SK: `STAGE_QUESTION#${question_id}`,
            },
            TableName: DYNAMO_TABLE_NAME,
          },
        },
        {
          // Update Question Order
          Update: {
            Key: {
              PK: `ORG#${org_id}#OPENING#${opening_id}#STAGE#${stage_id}`,
              SK: `STAGE`,
            },
            TableName: DYNAMO_TABLE_NAME,
            UpdateExpression: "SET question_order = :question_order",
            ExpressionAttributeValues: {
              ":question_order": stage.question_order,
            },
          },
        },
      ],
    };

    try {
      await Dynamo.send(new TransactWriteCommand(transactParams));

      return;
    } catch (error) {
      throw new Error(error);
    }
  } catch (error) {
    console.error(error);
    throw Error(`Unable to retrieve stage to delete question ${error}`);
  }
}
