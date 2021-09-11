import { GetUserByEmail } from "./getUserByEmail";
import { Dynamo } from "../../libs/ddbDocClient";
import { PutCommand, PutCommandInput } from "@aws-sdk/lib-dynamodb";
import { GetCurrentTime, GetPastOrFutureTime, GetRelativeTime } from "../time";
const { DYNAMO_TABLE_NAME } = process.env;
import { CreateUser } from "./createUser";
export default async function CreateOrgInvite({
  org_id,
  expires_at,
  invited_by,
  recipient,
}: CreateOrgInviteInput) {
  try {
    let user = await GetUserByEmail(recipient);

    if (!user) {
      try {
        const new_user: CreateUserInput = {
          first_name: "NO_FIRST_NAME",
          last_name: "NO_LAST_NAME",
          user_email: recipient,
        };

        user = await CreateUser(new_user);
      } catch (error) {
        console.error(error);
        throw new Error("Unable to create user being invited");
      }
    }

    const now = GetCurrentTime("iso");
    const new_org_invite = {
      PK: `USER#${user.user_id}`,
      SK: `ORG_INVITE#${now}`,
      org_id: org_id,
      invited_by: invited_by,
      entity_type: "ORG_INVITE",
      created_at: now,
      expires_at: expires_at,
      is_claimed: false,
      claimed_at: "",
      GSI1PK: `ORG#${org_id}#ORG_INVITES`,
      GSI1SK: now,
    };

    const params: PutCommandInput = {
      TableName: DYNAMO_TABLE_NAME,
      Item: new_org_invite,
      ConditionExpression: "attribute_not_exists(PK)",
    };

    await Dynamo.send(new PutCommand(params));
    return;
  } catch (error) {
    throw new Error(`Unable to retrieve user ${error}`);
  }
}
