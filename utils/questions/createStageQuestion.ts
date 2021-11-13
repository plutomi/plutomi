import {
  TransactWriteCommand,
  TransactWriteCommandInput,
} from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../awsClients/ddbDocClient";
import { GetCurrentTime } from "../time";
import { nanoid } from "nanoid";
import { getStage } from "../stages/getStage";
import { MAX_CHILD_ITEM_LIMIT, MAX_ITEM_LIMIT_ERROR } from "../../Config";

const { DYNAMO_TABLE_NAME } = process.env;

export async function CreateStageQuestion({
  orgId,
  stageId,
  GSI1SK,
  questionDescription,
}: CreateStageQuestionInput) {
  const now = GetCurrentTime("iso") as string;
  const questionId = nanoid(70);
  const new_stage_question = {
    PK: `ORG#${orgId}#QUESTION#${questionId}`,
    SK: `STAGE_QUESTION`,
    questionDescription: questionDescription,
    questionId: questionId,
    entityType: "STAGE_QUESTION",
    createdAt: now,
    GSI1PK: `ORG#${orgId}#STAGE#${stageId}#QUESTIONS`,
    GSI1SK: GSI1SK,
    orgId: orgId,
    stageId: stageId,
  };

  try {
    let stage = await GetStage({ orgId, stageId });

    if (stage.questionOrder.length >= MAX_CHILD_ITEM_LIMIT) {
      throw MAX_ITEM_LIMIT_ERROR;
    }

    try {
      stage.questionOrder.push(questionId);

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
              UpdateExpression: "SET questionOrder = :questionOrder",
              ExpressionAttributeValues: {
                ":questionOrder": stage.questionOrder,
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
