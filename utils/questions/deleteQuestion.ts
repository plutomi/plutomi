import {
  TransactWriteCommand,
  TransactWriteCommandInput,
} from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../awsClients/ddbDocClient";
import { ENTITY_TYPES } from "../../defaults";
import { DeleteQuestionInput } from "../../types/main";
const { DYNAMO_TABLE_NAME } = process.env;
import { getStageById } from "../stages/getStageById";
import { getQuestionById } from "./getQuestionById";
export async function DeleteQuestion(
  props: DeleteQuestionInput
): Promise<void> {
  const { orgId, questionId } = props;
  // Delete the question item & update the question order on the stage
  try {
    let question = await getQuestionById({ orgId, questionId });
    let stage = await getStageById({ orgId, stageId: question.stageId });
    const deletedQuestionIndex = stage.questionOrder.indexOf(questionId);

    // Update question order
    stage.questionOrder.splice(deletedQuestionIndex, 1);

    const transactParams: TransactWriteCommandInput = {
      TransactItems: [
        {
          // Delete question
          Delete: {
            Key: {
              PK: `${ENTITY_TYPES.ORG}#${orgId}#${ENTITY_TYPES.STAGE_QUESTION}#${questionId}`,
              SK: `${ENTITY_TYPES.STAGE_QUESTION}`,
            },
            TableName: DYNAMO_TABLE_NAME,
          },
        },
        {
          // Update Question Order
          Update: {
            Key: {
              PK: `${ENTITY_TYPES.ORG}#${orgId}#${ENTITY_TYPES.STAGE}#${stage.stageId}`,
              SK: `${ENTITY_TYPES.STAGE}`,
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
