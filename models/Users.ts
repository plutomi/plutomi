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
import { DEFAULTS, EMAILS, ENTITY_TYPES, ID_LENGTHS } from "../Config";
import { DynamoNewOrgInvite, DynamoNewUser } from "../types/dynamo";
import {
  CreateOrgInviteInput,
  CreateUserInput,
  DeleteOrgInviteInput,
  GetOrgInviteInput,
  GetOrgInvitesForUserInput,
  GetUserByEmailInput,
  GetUserByIdInput,
} from "../types/main";
import sendEmail from "../utils/sendEmail";

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

export const createUser = async (
  props: CreateUserInput
): Promise<DynamoNewUser> => {
  const { email, firstName, lastName } = props;

  const userId = nanoid(ID_LENGTHS.USER);
  const newUser: DynamoNewUser = {
    PK: `${ENTITY_TYPES.USER}#${userId}`,
    SK: ENTITY_TYPES.USER,
    firstName: firstName || DEFAULTS.FIRST_NAME,
    lastName: lastName || DEFAULTS.LAST_NAME,
    email: email.toLowerCase().trim(),
    userId: userId,
    entityType: ENTITY_TYPES.USER,
    createdAt: Time.currentISO(),
    orgId: DEFAULTS.NO_ORG,
    orgJoinDate: DEFAULTS.NO_ORG,
    GSI1PK: `${ENTITY_TYPES.ORG}#${DEFAULTS.NO_ORG}#${ENTITY_TYPES.USER}S`,
    GSI1SK:
      firstName && lastName ? `${firstName} ${lastName}` : DEFAULTS.FULL_NAME,
    GSI2PK: email.toLowerCase().trim(),
    GSI2SK: ENTITY_TYPES.USER,
  };

  const params: PutCommandInput = {
    TableName: DYNAMO_TABLE_NAME,
    Item: newUser,
    ConditionExpression: "attribute_not_exists(PK)",
  };

  try {
    await Dynamo.send(new PutCommand(params));
    sendEmail({
      // TODO streams
      fromName: "New Plutomi User",
      fromAddress: EMAILS.GENERAL,
      toAddresses: ["contact@plutomi.com"], // TODO add var for default new user notifications
      subject: `A new user has signed up!`,
      html: `<h1>Email: ${newUser.email}</h1><h1>ID: ${newUser.userId}</h1>`,
    });
    return newUser;
  } catch (error) {
    throw new Error(error);
  }
};

export const getUserByEmail = async (props: GetUserByEmailInput) => {
  const { email } = props;
  const params: QueryCommandInput = {
    TableName: DYNAMO_TABLE_NAME,
    IndexName: "GSI2",
    KeyConditionExpression: "GSI2PK = :GSI2PK AND GSI2SK = :GSI2SK",
    ExpressionAttributeValues: {
      ":GSI2PK": email.toLowerCase().trim(),
      ":GSI2SK": ENTITY_TYPES.USER,
    },
  };

  try {
    const response = await Dynamo.send(new QueryCommand(params));
    return response.Items[0] as DynamoNewUser; // TODO
    // TODO are we sure the first item will be the user? Switch this to .find
  } catch (error) {
    throw new Error(error);
  }
};

/**
 * Returns a user's metadata
 * @param userId The userId you want to find
 * @returns - {@link DynamoNewUser}
 */
export const getUserById = async (props: GetUserByIdInput) => {
  const { userId } = props;
  const params: GetCommandInput = {
    TableName: DYNAMO_TABLE_NAME,
    Key: {
      PK: `${ENTITY_TYPES.USER}#${userId}`,
      SK: ENTITY_TYPES.USER,
    },
  };

  try {
    const response = await Dynamo.send(new GetCommand(params));
    return response.Item as DynamoNewUser;
  } catch (error) {
    throw new Error(error);
  }
};
