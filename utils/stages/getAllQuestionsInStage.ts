import { QueryCommand, QueryCommandInput } from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../libs/ddbDocClient";
import { GetStageById } from "./getStageById";

const { DYNAMO_TABLE_NAME } = process.env;

export async function GetAllQuestionsInStage({ org_id, opening_id, stage_id }) {
  const stage = await GetStageById({ org_id, opening_id, stage_id });
  const { question_order } = stage;
  const params: QueryCommandInput = {
    TableName: DYNAMO_TABLE_NAME,
    KeyConditionExpression: "PK = :pk AND begins_with(SK, :sk)",
    ExpressionAttributeValues: {
      ":pk": `ORG#${org_id}#OPENING#${opening_id}#STAGE#${stage_id}`,
      ":sk": "STAGE_QUESTION#",
    },
    ScanIndexForward: false,
  };

  try {
    const all_questions = await Dynamo.send(new QueryCommand(params));

    // Sort questions in the same order of the stage before sending it back
    const result = question_order.map((i) =>
      all_questions.Items.find((j) => j.question_id === i)
    );

    return result;
  } catch (error) {
    throw new Error(error);
  }
}
