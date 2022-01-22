import { QueryCommandInput, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../AWSClients/ddbDocClient";
import { ENTITY_TYPES } from "../../Config";
import { DynamoNewLoginLink } from "../../types/dynamo";
import { GetLatestLoginLinkInput } from "../../types/main";
const { DYNAMO_TABLE_NAME } = process.env;
import { SdkError } from "@aws-sdk/types";
export default async function GetLatestLink(
  props: GetLatestLoginLinkInput
): Promise<[DynamoNewLoginLink, null] | [null, SdkError]> {
  const { userId } = props;
  const params: QueryCommandInput = {
    TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,

    IndexName: "GSI1",
    KeyConditionExpression: "GSI1PK = :GSI1PK",
    ExpressionAttributeValues: {
      ":GSI1PK": `${ENTITY_TYPES.USER}#${userId}#${ENTITY_TYPES.LOGIN_LINK}S`, // TODO login links dont need GSIs, begins_with login link
    },
    ScanIndexForward: false,
    Limit: 1,
  };

  try {
    const response = await Dynamo.send(new QueryCommand(params));
    return [response.Items[0] as DynamoNewLoginLink, null];
  } catch (error) {
    return [null, error];
  }
}
