import { QueryCommandInput, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../awsClients/ddbDocClient";
import { ENTITY_TYPES } from "../../Config";
import { DynamoNewOrgInvite } from "../../types/dynamo";
import { GetOrgInvitesForUserInput } from "../../types/main";
const { DYNAMO_TABLE_NAME } = process.env;

/**
 * Given a `userId`, returns the user's invites to join an org
 * @param props {@link GetOrgInvitesForUserInput}
 * @returns - {@link DynamoNewOrgInvite[]}
 */

export default async function getInvites(
  props: GetOrgInvitesForUserInput
): Promise<[DynamoNewOrgInvite[], null] | [null, Error]> {
  const { userId } = props;
  const params: QueryCommandInput = {
    TableName: DYNAMO_TABLE_NAME,
    KeyConditionExpression: "PK = :pk AND begins_with(SK, :sk)",
    ExpressionAttributeValues: {
      ":pk": `${ENTITY_TYPES.USER}#${userId}`,
      ":sk": ENTITY_TYPES.ORG_INVITE,
    },
  };

  try {
    const response = await Dynamo.send(new QueryCommand(params));
    return [response.Items as DynamoNewOrgInvite[], null];
  } catch (error) {
    return [null, error];
  }
}
