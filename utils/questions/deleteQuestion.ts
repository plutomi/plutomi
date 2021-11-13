import {
  TransactWriteCommand,
  TransactWriteCommandInput,
} from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../awsClients/ddbDocClient";
const { DYNAMO_TABLE_NAME } = process.env;
import { getStage } from "../stages/getStage";
import { GetQuestion } from "./getQuestionById";
export async function DeleteQuestion({ orgId, questionId }) {
  // Delete the question item & update the question order on the stage
  try {
    let question = await GetQuestion({ orgId, questionId });
    let stage = await GetStage({ orgId, stageId: question.stageId });
    const deleted_question_index = stage.questionOrder.indexOf(questionId);

    // Update question order
    stage.questionOrder.splice(deleted_question_index, 1);

    const transactParams: TransactWriteCommandInput = {
      TransactItems: [
        {
          // Delete question
          Delete: {
            Key: {
              PK: `ORG#${orgId}#QUESTION#${questionId}`,
              SK: `STAGE_QUESTION`,
            },
            TableName: DYNAMO_TABLE_NAME,
          },
        },
        {
          // Update Question Order
          Update: {
            Key: {
              PK: `ORG#${orgId}#STAGE#${stage.stageId}`,
              SK: `STAGE`,
            },
            TableName: DYNAMO_TABLE_NAME,
            UpdateExpression: "SET questionOrder = :questionOrder",
            ExpressionAttributeValues: {
              ":questionOrder": stage.questionOrder,
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
