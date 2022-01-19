import { QueryCommandInput, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../awsClients/ddbDocClient";
import { ENTITY_TYPES } from "../../Config";
import {
  GetAllQuestionsInStageInput,
  GetAllQuestionsInStageOutput,
} from "../../types/main";
import getStageById from "./getStageById";
const { DYNAMO_TABLE_NAME } = process.env;
import { SdkError } from "@aws-sdk/types";
export default async function GetQuestions(
  props: GetAllQuestionsInStageInput
): Promise<[GetAllQuestionsInStageOutput, null] | [null, SdkError]> {
  const { orgId, stageId, questionOrder } = props;

  const params: QueryCommandInput = {
    IndexName: "GSI1",
    TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,

    KeyConditionExpression: "GSI1PK = :GSI1PK",
    ExpressionAttributeValues: {
      ":GSI1PK": `${ENTITY_TYPES.ORG}#${orgId}#${ENTITY_TYPES.STAGE}#${stageId}#QUESTIONS`, // NOT STAGE_QUESTIONS, just QUESTIONS
    },
  };

  try {
    const allQuestions = await Dynamo.send(new QueryCommand(params));

    // Sort questions in the same order of the stage before sending it back
    const result = questionOrder.map((i) =>
      allQuestions.Items.find((j) => j.questionId === i)
    );

    return [result as GetAllQuestionsInStageOutput, null];
  } catch (error) {
    return [null, error];
  }
}
