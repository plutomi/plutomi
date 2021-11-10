import {
  TransactWriteCommand,
  TransactWriteCommandInput,
} from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../lib/awsClients/ddbDocClient";
const { DYNAMO_TABLE_NAME } = process.env;
import { getStage } from "../stages/getStage";
import { GetQuestion } from "./getQuestionById";
export async function DeleteQuestion({ orgId, question_id }) {
  // Delete the question item & update the question order on the stage
  try {
    let question = await GetQuestion({ orgId, question_id });
    let stage = await getStage({ orgId, stage_id: question.stage_id });
    const deleted_question_index = stage.question_order.indexOf(question_id);

    // Update question order
    stage.question_order.splice(deleted_question_index, 1);

    const transactParams: TransactWriteCommandInput = {
      TransactItems: [
        {
          // Delete question
          Delete: {
            Key: {
              PK: `ORG#${orgId}#QUESTION#${question_id}`,
              SK: `STAGE_QUESTION`,
            },
            TableName: DYNAMO_TABLE_NAME,
          },
        },
        {
          // Update Question Order
          Update: {
            Key: {
              PK: `ORG#${orgId}#STAGE#${stage.stage_id}`,
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
      console.error(error);
      throw new Error(error);
    }
  } catch (error) {
    console.error(error);
    throw Error(`Unable to retrieve stage to delete question ${error}`);
  }
}
