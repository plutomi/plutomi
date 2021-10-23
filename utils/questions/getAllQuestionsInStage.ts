import { QueryCommand, QueryCommandInput } from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../libs/ddbDocClient";
import { GetStage } from "../stages/getStage";

const { DYNAMO_TABLE_NAME } = process.env;

export async function GetAllQuestionsInStage({ org_id, stage_id }) {
  const stage = await GetStage({ org_id, stage_id });
  const { question_order } = stage;

  const params: QueryCommandInput = {
    IndexName: "GSI1",
    TableName: DYNAMO_TABLE_NAME,
    KeyConditionExpression: "GSI1PK = :GSI1PK",
    ExpressionAttributeValues: {
      ":GSI1PK": `ORG#${org_id}#STAGE#${stage_id}#QUESTIONS`,
    },
  };

  try {
    const all_questions = await Dynamo.send(new QueryCommand(params));

    // Sort questions in the same order of the stage before sending it back
    const result = question_order.map((i) =>
      all_questions.Items.find((j) => j.question_id === i)
    );

    return result;
  } catch (error) {
    console.error(error);
    throw new Error(error);
  }
}
