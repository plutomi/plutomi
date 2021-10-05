import {
  TransactWriteCommand,
  TransactWriteCommandInput,
} from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../libs/ddbDocClient";
import { GetCurrentTime } from "../time";
import { nanoid } from "nanoid";
import { GetStageById } from "../stages/getStageById";
import UpdateStage from "../stages/updateStage";

const { DYNAMO_TABLE_NAME } = process.env;

export async function CreateStageQuestion({
  org_id,
  opening_id,
  stage_id,
  GSI1SK,
  question_description,
}: CreateStageQuestionInput) {
  const now = GetCurrentTime("iso");
  const stage_question_id = nanoid(16);
  const new_stage_question = {
    PK: `ORG#${org_id}#OPENING#${opening_id}#STAGE#${stage_id}`,
    SK: `STAGE_QUESTION#${stage_question_id}`,
    question_description: question_description,
    question_id: stage_question_id,
    entity_type: "STAGE_QUESTION",
    created_at: now,
    GSI1PK: `ORG#${org_id}#QUESTIONS`,
    GSI1SK: GSI1SK, // TODO filter by opening by stage?
  };

  try {
    let stage = await GetStageById({ org_id, opening_id, stage_id });

    try {
      stage.question_order.push(stage_question_id);

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
