import { PutCommandInput, PutCommand } from "@aws-sdk/lib-dynamodb";
import { nanoid } from "nanoid";
import { Dynamo } from "../../AWSClients/ddbDocClient";
import { ID_LENGTHS, ENTITY_TYPES } from "../../Config";
import { DynamoQuestion } from "../../types/dynamo";
import { CreateQuestionInput } from "../../types/main";
import * as Time from "../../utils/time";
import { SdkError } from "@aws-sdk/types";
const { DYNAMO_TABLE_NAME } = process.env;
export default async function CreateQuestion(
  props: CreateQuestionInput
): Promise<[null, null] | [null, SdkError]> {
  const { orgId, GSI1SK, questionId, description } = props;
  const now = Time.currentISO();
  const newStageQuestion: DynamoQuestion = {
    PK: `${ENTITY_TYPES.ORG}#${orgId}#${ENTITY_TYPES.QUESTION}#${questionId}`,
    SK: ENTITY_TYPES.QUESTION,
    orgId,
    description: description || "",
    questionId, // TODO add tag generator
    entityType: ENTITY_TYPES.QUESTION,
    createdAt: now,
    totalStages: 0,
    // All questions in org
    GSI1PK: `${ENTITY_TYPES.ORG}#${orgId}#${ENTITY_TYPES.QUESTION}S`,
    GSI1SK,
  };

  try {
    const params: PutCommandInput = {
      Item: newStageQuestion,
      TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,
      ConditionExpression: "attribute_not_exists(PK)",
    };

    await Dynamo.send(new PutCommand(params));
    return [null, null];
  } catch (error) {
    return [null, error];
  }
}
