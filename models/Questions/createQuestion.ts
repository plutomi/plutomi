import {
  TransactWriteCommandInput,
  TransactWriteCommand,
} from "@aws-sdk/lib-dynamodb";
import { nanoid } from "nanoid";
import { Dynamo } from "../../awsClients/ddbDocClient";
import { ID_LENGTHS, ENTITY_TYPES, LIMITS, ERRORS } from "../../Config";
import { DynamoNewStageQuestion } from "../../types/dynamo";
import { CreateStageQuestionInput } from "../../types/main";
import * as Time from "../../utils/time";
const { DYNAMO_TABLE_NAME } = process.env;
export default async function Create(
  props: CreateStageQuestionInput
): Promise<void> {
  const { orgId, stageId, GSI1SK, questionDescription } = props;
  const now = Time.currentISO();
  const questionId = nanoid(ID_LENGTHS.STAGE_QUESTION);
  const newStageQuestion: DynamoNewStageQuestion = {
    PK: `${ENTITY_TYPES.ORG}#${orgId}#${ENTITY_TYPES.STAGE_QUESTION}#${questionId}`,
    SK: ENTITY_TYPES.STAGE_QUESTION,
    questionDescription: questionDescription || "",
    questionId: questionId,
    entityType: ENTITY_TYPES.STAGE_QUESTION,
    createdAt: now,
    GSI1PK: `${ENTITY_TYPES.ORG}#${orgId}#${ENTITY_TYPES.STAGE}#${stageId}#QUESTIONS`,
    GSI1SK: GSI1SK,
    orgId: orgId,
    stageId: stageId,
  };

  try {
    let stage = await getStageById({ orgId, stageId });

    if (stage.questionOrder.length >= LIMITS.MAX_CHILD_ENTITY_LIMIT) {
      throw ERRORS.MAX_CHILD_ENTITY_LIMIT_ERROR_MESSAGE;
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
                PK: `${ENTITY_TYPES.ORG}#${orgId}#${ENTITY_TYPES.STAGE}#${stageId}`,
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

      await Dynamo.send(new TransactWriteCommand(transactParams));
      return;
    } catch (error) {
      throw new Error(error);
    }
  } catch (error) {
    throw new Error(
      `Unable to retrieve stage where question should be added ${error}` // TODO add to errors
    );
  }
}
