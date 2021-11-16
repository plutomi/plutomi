import {
  TransactWriteCommand,
  TransactWriteCommandInput,
} from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../awsClients/ddbDocClient";
import Time from "../time";
import { nanoid } from "nanoid";
import { getStageById } from "../stages/getStageById";

const { DYNAMO_TABLE_NAME } = process.env;

export async function createStageQuestion(
  props: CreateStageQuestionInput
): Promise<void> {
  const { orgId, stageId, GSI1SK, questionDescription } = props;
  const now = Time.currentISO();
  const questionId = nanoid(50);
  const newStageQuestion: DynamoNewStageQuestion = {
    PK: `ORG#${orgId}#STAGE_QUESTION#${questionId}`,
    SK: ENTITY_TYPES.STAGE_QUESTION,
    questionDescription: questionDescription || "",
    questionId: questionId,
    entityType: ENTITY_TYPES.STAGE_QUESTION,
    createdAt: now,
    GSI1PK: `ORG#${orgId}#STAGE#${stageId}#QUESTIONS`,
    GSI1SK: GSI1SK,
    orgId: orgId,
    stageId: stageId,
  };

  try {
    let stage = await getStageById({ orgId, stageId });

    if (stage.questionOrder.length >= Limits.MAX_CHILD_ITEM_LIMIT) {
      throw ERRORS.MAX_CHILD_ITEM_LIMIT_ERROR_MESSAGE;
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
