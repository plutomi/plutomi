import {
  TransactWriteCommand,
  TransactWriteCommandInput,
} from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../libs/ddbDocClient";
import { GetCurrentTime } from "../time";
import { nanoid } from "nanoid";
import { GetStage } from "../stages/getStage";
import UpdateStage from "../stages/updateStage";

const { DYNAMO_TABLE_NAME } = process.env;

export async function CreateStageQuestion({
  org_id,
  stage_id,
  GSI1SK,
  question_description,
}: CreateStageQuestionInput) {
  const now = GetCurrentTime("iso") as string;
  const question_id = nanoid(70);
  const new_stage_question = {
    PK: `ORG#${org_id}#QUESTION#${question_id}`,
    SK: `STAGE_QUESTION`,
    question_description: question_description,
    question_id: question_id,
    entity_type: "STAGE_QUESTION",
    created_at: now,
    GSI1PK: `ORG#${org_id}#STAGE#${stage_id}#QUESTIONS`,
    GSI1SK: GSI1SK,
    org_id: org_id,
    stage_id: stage_id,
  };

  try {
    let stage = await GetStage({ org_id, stage_id });

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
                PK: `ORG#${org_id}#STAGE#${stage_id}`,
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
