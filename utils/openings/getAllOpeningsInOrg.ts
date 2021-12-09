import { QueryCommand, QueryCommandInput } from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../awsClients/ddbDocClient";
import { ENTITY_TYPES } from "../../Config";
import { DynamoNewOpening } from "../../types/dynamo";
import { GetAllOpeningsInOrgInput } from "../../types/main";
const { DYNAMO_TABLE_NAME } = process.env;

/**
 *
 *
 *
 *
 *
 *
 * TODOOOOOOOOOOOOOOOOOOOO
 *
 * Move this to the org
 */
export async function getAllOpeningsInOrg(props: GetAllOpeningsInOrgInput) {
  const { orgId } = props;
  const params: QueryCommandInput = {
    TableName: DYNAMO_TABLE_NAME,
    IndexName: "GSI1",
    KeyConditionExpression: "GSI1PK = :GSI1PK",
    ExpressionAttributeValues: {
      ":GSI1PK": `${ENTITY_TYPES.ORG}#${orgId}#${ENTITY_TYPES.OPENING}S`,
    },
  };

  try {
    const response = await Dynamo.send(new QueryCommand(params));
    return [response.Items, null];
  } catch (error) {
    console.error("error", error);
    return [null, error];
  }
}
