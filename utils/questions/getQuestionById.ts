import { GetCommand, GetCommandInput } from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../awsClients/ddbDocClient";
import { GetQuestionInput, GetQuestionOutput } from "../../types/Questions";

const { DYNAMO_TABLE_NAME } = process.env;

export async function getQuestionById(
  props: GetQuestionInput
): Promise<GetQuestionOutput> {
  const { orgId, questionId } = props;
  const params: GetCommandInput = {
    TableName: DYNAMO_TABLE_NAME,
    Key: {
      PK: `ORG#${orgId}#QUESTION#${questionId}`,
      SK: `QUESTION`,
    },
  };

  try {
    const response = await Dynamo.send(new GetCommand(params));
    return response.Item as GetQuestionOutput;
  } catch (error) {
    throw new Error(error);
  }
}
