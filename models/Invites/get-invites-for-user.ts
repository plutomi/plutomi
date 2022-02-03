import { QueryCommandInput, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../AWSClients/ddbDocClient";
import { ENTITY_TYPES } from "../../Config";
import { DynamoOrgInvite } from "../../types/dynamo";
import { GetOrgInvitesForUserInput } from "../../types/main";
const { DYNAMO_TABLE_NAME } = process.env;
import { SdkError } from "@aws-sdk/types";
/**
 * Given a `userId`, returns the user's invites to join an org
 * @param props {@link GetOrgInvitesForUserInput}
 * @returns - {@link DynamoOrgInvite[]}
 */

export default async function getInvites(
  props: GetOrgInvitesForUserInput
): Promise<[DynamoOrgInvite[], null] | [null, SdkError]> {
  const { userId } = props;
  const params: QueryCommandInput = {
    TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,

    KeyConditionExpression: "PK = :PK AND begins_with(SK, :SK)",
    ExpressionAttributeValues: {
      ":PK": `${ENTITY_TYPES.USER}#${userId}`,
      ":SK": ENTITY_TYPES.ORG_INVITE,
    },
  };

  try {
    const response = await Dynamo.send(new QueryCommand(params));
    return [response.Items as DynamoOrgInvite[], null];
  } catch (error) {
    return [null, error];
  }
}
