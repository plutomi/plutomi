import { QueryCommand, QueryCommandInput } from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../awsClients/ddbDocClient";
import { ENTITY_TYPES } from "../../Config";
import { DynamoNewLoginLink } from "../../types/dynamo";
import { GetLatestLoginLinkInput } from "../../types/main";

const { DYNAMO_TABLE_NAME } = process.env;
/**
 * Returns the latest login link for a user. Used to compare timestamps with a login timeout to make sure you can't spam login links
 * @param props
 * @returns
 */
export async function getLatestLoginLink(
  props: GetLatestLoginLinkInput
): Promise<DynamoNewLoginLink> {
  const { userId } = props;
  const params: QueryCommandInput = {
    TableName: DYNAMO_TABLE_NAME,
    IndexName: "GSI1",
    KeyConditionExpression: "GSI1PK = :GSI1PK",
    ExpressionAttributeValues: {
      ":GSI1PK": `${ENTITY_TYPES.USER}#${userId}#${ENTITY_TYPES.LOGIN_LINK}S`,
    },
    ScanIndexForward: false,
    Limit: 1,
  };

  try {
    const response = await Dynamo.send(new QueryCommand(params));
    return response.Items[0] as DynamoNewLoginLink;
  } catch (error) {
    throw new Error(error);
  }
}
