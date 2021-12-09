import {
  DeleteCommand,
  PutCommand,
  PutCommandInput,
  DeleteCommandInput,
  GetCommand,
  GetCommandInput,
  QueryCommandInput,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../awsClients/ddbDocClient";
import * as Time from "./../utils/time";
import { nanoid } from "nanoid";
import { ENTITY_TYPES, ID_LENGTHS } from "../Config";
import { DynamoNewOrgInvite } from "../types/dynamo";
import {
  CreateOrgInviteInput,
  DeleteOrgInviteInput,
  GetOrgInviteInput,
  GetOrgInvitesForUserInput,
} from "../types/main";

const { DYNAMO_TABLE_NAME } = process.env;

/**
 * Given a `userId`, returns the user's invites to join an org
 * @param props {@link GetOrgInvitesForUserInput}
 * @returns - {@link DynamoNewOrgInvite[]}
 */
export const getInvitesForUser = async (
  props: GetOrgInvitesForUserInput
): Promise<DynamoNewOrgInvite[]> => {
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
    return response.Items as DynamoNewOrgInvite[];
  } catch (error) {
    console.log("Error getting org invites", error);
    throw new Error(error);
  }
};
