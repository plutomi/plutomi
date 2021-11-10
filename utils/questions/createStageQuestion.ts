import {
  TransactWriteCommand,
  TransactWriteCommandInput,
} from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../awsClients/ddbDocClient";
import { getCurrentTime } from "../time";
import { nanoid } from "nanoid";
import { getStage } from "../stages/getStage";
import { MAX_CHILD_ITEM_LIMIT, MAX_ITEM_LIMIT_ERROR } from "../../Config";

const { DYNAMO_TABLE_NAME } = process.env;

export async function CreateStageQuestion({
  orgId,
  stageId,
  GSI1SK,
  question_description,
}: CreateStageQuestionInput) {
  const now = getCurrentTime("iso") as string;
  const question_id = nanoid(70);
  const new_stage_question = {
    PK: `ORG#${orgId}#QUESTION#${question_id}`,
    SK: `STAGE_QUESTION`,
    question_description: question_description,
    question_id: question_id,
    entityType: "STAGE_QUESTION",
    created_at: now,
    GSI1PK: `ORG#${orgId}#STAGE#${stageId}#QUESTIONS`,
    GSI1SK: GSI1SK,
    orgId: orgId,
    stageId: stageId,
  };

  try {
    let stage = await getStage({ orgId, stageId });

    if (stage.question_order.length >= MAX_CHILD_ITEM_LIMIT) {
      throw MAX_ITEM_LIMIT_ERROR;
    }

    try {
      stage.question_order.push(question_id);

      const transactParams: TransactWriteCommandInput = {
        TransactItems: [
          {
            // Add question
            Put: {
              Item: new_stage_question,
              TableName: DYNAMO_TABLE_NAME,
            },
          },
          {
            // Add question to question order
            Update: {
              Key: {
                PK: `ORG#${orgId}#STAGE#${stageId}`,
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

      await Dynamo.send(new TransactWriteCommand(transactParams));
      return;
    } catch (error) {
      throw new Error(error);
    }
  } catch (error) {
    throw new Error(
      `Unable to retrieve stage where question should be added ${error}`
    );
  }
}
