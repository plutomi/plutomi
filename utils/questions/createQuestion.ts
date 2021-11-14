import {
  TransactWriteCommand,
  TransactWriteCommandInput,
} from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../awsClients/ddbDocClient";
import Time from "../time";
import { nanoid } from "nanoid";
import { getStage } from "../stages/getStage";
import { EntityTypes, Errors, Limits } from "../../additional";
import { QuestionsDynamoEntry, CreateQuestionInput } from "../../Questions";

const { DYNAMO_TABLE_NAME } = process.env;

export async function createQuestion(props: CreateQuestionInput) {
  const { orgId, stageId, GSI1SK, questionDescription } = props;
  const now = Time.currentISO();
  const questionId = nanoid(50);
  const newStageQuestion: QuestionsDynamoEntry = {
    PK: `ORG#${orgId}#QUESTION#${questionId}`,
    SK: EntityTypes.STAGE_QUESTION,
    questionDescription: questionDescription || "",
    questionId: questionId,
    entityType: EntityTypes.STAGE_QUESTION,
    createdAt: now,
    GSI1PK: `ORG#${orgId}#STAGE#${stageId}#QUESTIONS`,
    GSI1SK: GSI1SK,
    orgId: orgId,
    stageId: stageId,
  };

  try {
    let stage = await getStage({ orgId, stageId });

    if (stage.questionOrder.length >= Limits.MAX_CHILD_ITEM_LIMIT) {
      throw Errors.MAX_CHILD_ITEM_LIMIT_ERROR_MESSAGE;
    }

    try {
      stage.questionOrder.push(questionId);

      const transactParams: TransactWriteCommandInput = {
        TransactItems: [
          {
            // Add question
            Put: {
              Item: newStageQuestion,
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
