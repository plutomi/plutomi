import { GetCommandInput, GetCommand } from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../awsClients/ddbDocClient";
import { ENTITY_TYPES } from "../../Config";
import { GetQuestionInput, GetQuestionOutput } from "../../types/main";
const { DYNAMO_TABLE_NAME } = process.env;
export default async function Get(
  props: GetQuestionInput
): Promise<[GetQuestionOutput, null] | [null, Error]> {
  const { orgId, questionId } = props;
  const params: GetCommandInput = {
    TableName: DYNAMO_TABLE_NAME,
    Key: {
      PK: `${ENTITY_TYPES.ORG}#${orgId}#${ENTITY_TYPES.STAGE_QUESTION}#${questionId}`,
      SK: ENTITY_TYPES.STAGE_QUESTION,
    },
  };

  try {
    const response = await Dynamo.send(new GetCommand(params));
    return [response.Item as GetQuestionOutput, null];
  } catch (error) {
    return [null, error];
  }
}
