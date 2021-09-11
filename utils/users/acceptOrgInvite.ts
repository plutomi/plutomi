import { GetUserByEmail } from "./getUserByEmail";
import { Dynamo } from "../../libs/ddbDocClient";
import { GetOrgInvite } from "./getOrgInvite";
import { PutCommand, PutCommandInput } from "@aws-sdk/lib-dynamodb";
import { GetCurrentTime, GetPastOrFutureTime, GetRelativeTime } from "../time";
const { DYNAMO_TABLE_NAME } = process.env;
import { CreateUser } from "./createUser";
import { nanoid } from "nanoid";
import { GetUserById } from "./getUserById";
export default async function AcceptOrgInvite({
  user_id,
  invite_id,
  timestamp,
}: GetOrgInviteInput) {
  try {
    let user = await GetUserById(user_id);

    if (!user) {
      throw new Error("Unable to claim invite, user does not exist");
    }

    let invite = await GetOrgInvite({ user_id, invite_id, timestamp });

    if (!invite) {
      throw new Error("Invite no longer exists");
    }

    if (invite.is_claimed) {
      throw new Error("Invite has already been claimed");
    }

    if (invite.expires_at <= GetCurrentTime("iso")) {
      throw new Error("Invite has expired"); // TODO delete this invite
    }

    const now = GetCurrentTime("iso");
    const updated_invite = {
      ...invite,
      is_claimed: true,
      claimed_at: now,
    };

    const params: PutCommandInput = {
      TableName: DYNAMO_TABLE_NAME,
      Item: updated_invite,
    };

    await Dynamo.send(new PutCommand(params));
    return;
  } catch (error) {
    throw new Error(`Unable to retrieve user ${error}`);
  }
}
