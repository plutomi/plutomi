import {
  TransactWriteCommandInput,
  TransactWriteCommand,
} from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../awsClients/ddbDocClient";
import { ENTITY_TYPES } from "../../Config";
import { DeleteQuestionInput } from "../../types/main";
import { getQuestionById } from "./Questions";
const { DYNAMO_TABLE_NAME } = process.env;
import * as Stages from "../Stages/Stages";
import * as Questions from "../Questions/Questions";
export default async function DeleteQuestion(
  props: DeleteQuestionInput
): Promise<void> {
  const { orgId, questionId } = props;
  // Delete the question item & update the question order on the stage
  try {
    let question = await Questions.getQuestionById({ orgId, questionId });
    // TODO this shouldnt be here!!!
    let stage = await Stages.getStageById({ orgId, stageId: question.stageId });
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
              SK: ENTITY_TYPES.STAGE_QUESTION,
            },
            TableName: DYNAMO_TABLE_NAME,
          },
        },
        {
          // Update Question Order
          Update: {
            Key: {
              PK: `${ENTITY_TYPES.ORG}#${orgId}#${ENTITY_TYPES.STAGE}#${stage.stageId}`,
              SK: ENTITY_TYPES.STAGE,
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
