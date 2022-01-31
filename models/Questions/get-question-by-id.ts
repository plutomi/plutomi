import { GetCommandInput, GetCommand } from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../AWSClients/ddbDocClient";
import { ENTITY_TYPES } from "../../Config";
import { GetQuestionInput, GetQuestionOutput } from "../../types/main";
const { DYNAMO_TABLE_NAME } = process.env;
import { SdkError } from "@aws-sdk/types";

export default async function Get(
  props: GetQuestionInput
): Promise<[GetQuestionOutput, null] | [null, SdkError]> {
  const { orgId, questionId } = props;
  const params: GetCommandInput = {
    TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,
    Key: {
      PK: `${ENTITY_TYPES.ORG}#${orgId}#${ENTITY_TYPES.QUESTION}#${questionId}`,
      SK: ENTITY_TYPES.QUESTION,
    },
  };

  try {
    const response = await Dynamo.send(new GetCommand(params));
    return [response.Item as GetQuestionOutput, null];
  } catch (error) {
    return [null, error];
  }
}
