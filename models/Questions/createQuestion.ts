import {
  TransactWriteCommandInput,
  TransactWriteCommand,
} from "@aws-sdk/lib-dynamodb";
import { nanoid } from "nanoid";
import { Dynamo } from "../../AWSClients/ddbDocClient";
import { ID_LENGTHS, ENTITY_TYPES, TIME_UNITS } from "../../Config";
import { DynamoNewStageQuestion } from "../../types/dynamo";
import { CreateStageQuestionInput } from "../../types/main";
import * as Time from "../../utils/time";
import * as Stages from "../Stages/index";
import { SdkError } from "@aws-sdk/types";
const { DYNAMO_TABLE_NAME } = process.env;
export default async function Create(
  props: CreateStageQuestionInput
): Promise<[null, null] | [null, SdkError]> {
  const { orgId, stageId, GSI1SK, questionDescription, questionOrder } = props;
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

  // If in dev, set a TTL for auto delete
  if (process.env.NODE_ENV === "development") {
    newStageQuestion["ttlExpiry"] = Time.futureUNIX(1, TIME_UNITS.DAYS);
  }

  try {
    questionOrder.push(questionId);

    const transactParams: TransactWriteCommandInput = {
      TransactItems: [
        {
          // Add question
          Put: {
            Item: newStageQuestion,
            TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,
          },
        },
        {
          // Add question to question order
          Update: {
            Key: {
              PK: `${ENTITY_TYPES.ORG}#${orgId}#${ENTITY_TYPES.STAGE}#${stageId}`,
              SK: ENTITY_TYPES.STAGE,
            },
            TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,

            UpdateExpression: "SET questionOrder = :questionOrder",
            ExpressionAttributeValues: {
              ":questionOrder": questionOrder,
            },
          },
        },
      ],
    };

    await Dynamo.send(new TransactWriteCommand(transactParams));
    return [null, null];
  } catch (error) {
    return [null, error];
  }
}
