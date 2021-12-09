import {
  DeleteCommand,
  PutCommand,
  PutCommandInput,
  DeleteCommandInput,
  GetCommand,
  GetCommandInput,
  QueryCommandInput,
  QueryCommand,
  UpdateCommand,
  UpdateCommandInput,
} from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../awsClients/ddbDocClient";
import * as Time from "./../utils/time";
import { nanoid } from "nanoid";
import {
  DEFAULTS,
  EMAILS,
  ENTITY_TYPES,
  FORBIDDEN_PROPERTIES,
  ID_LENGTHS,
} from "../Config";
import {
  DynamoNewOrg,
  DynamoNewOrgInvite,
  DynamoNewUser,
} from "../types/dynamo";
import {
  CreateOrgInviteInput,
  CreateUserInput,
  DeleteOrgInviteInput,
  GetOrgInput,
  GetOrgInviteInput,
  GetOrgInvitesForUserInput,
  GetUserByEmailInput,
  GetUserByIdInput,
  UpdateUserInput,
} from "../types/main";
import sendEmail from "../utils/sendEmail";

const { DYNAMO_TABLE_NAME } = process.env;

export const getOrgById = async (
  props: GetOrgInput
): Promise<[DynamoNewOrg, null] | [null, Error]> => {
  // TODO add these types all over the dynamo calls
  const { orgId } = props;
  const params: GetCommandInput = {
    TableName: DYNAMO_TABLE_NAME,
    Key: {
      PK: `${ENTITY_TYPES.ORG}#${orgId}`,
      SK: ENTITY_TYPES.ORG,
    },
  };

  try {
    const response = await Dynamo.send(new GetCommand(params));
    return [response.Item as DynamoNewOrg, null];
  } catch (error) {
    console.error("error", error);
    return [null, error];
  }
};
