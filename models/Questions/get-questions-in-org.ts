import { QueryCommandInput, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../AWSClients/ddbDocClient";
import { ENTITY_TYPES } from "../../Config";
import {
  GetQuestionsInOrgInput,
  GetQuestionsInOrgOutput,
} from "../../types/main";
const { DYNAMO_TABLE_NAME } = process.env;
import { SdkError } from "@aws-sdk/types";
import { DynamoQuestion } from "../../types/dynamo";
export default async function GetQuestionsInOrg(
  props: GetQuestionsInOrgInput
): Promise<[GetQuestionsInOrgOutput, null] | [null, SdkError]> {
  const { orgId } = props;

  const params: QueryCommandInput = {
    IndexName: "GSI1",
    TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,
    KeyConditionExpression: "GSI1PK = :GSI1PK",
    ExpressionAttributeValues: {
      ":GSI1PK": `${ENTITY_TYPES.ORG}#${orgId}#${ENTITY_TYPES.QUESTION}S`,
    },
  };

  try {
    const orgQuestions = await Dynamo.send(new QueryCommand(params));
    return [orgQuestions.Items as DynamoQuestion[], null];
  } catch (error) {
    return [null, error];
  }
}
