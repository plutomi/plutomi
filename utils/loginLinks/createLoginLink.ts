import { PutCommand, PutCommandInput } from "@aws-sdk/lib-dynamodb";
import { GetCurrentTime, GetPastOrFutureTime } from "../time";
import { GetUserByEmail } from "../users/getUserByEmail";
import { Dynamo } from "../../libs/ddbDocClient";
import { CreateUser } from "../users/createUser";

const { DYNAMO_TABLE_NAME } = process.env;

export default async function CreateLoginLink({
  user_email,
  login_link_hash,
  login_link_expiry,
}: CreateLoginLinkInput) {
  try {
    let user = await GetUserByEmail(user_email);

    // Create a user if it does not exist // TODO is this ideal?
    // TODO if no user, use a transact to create the user and login code at the sametime
    if (!user) {
      try {
        const new_user: CreateUserInput = {
          first_name: "NO_FIRST_NAME",
          last_name: "NO_LAST_NAME",
          user_email: user_email,
        };

        user = await CreateUser(new_user);
      } catch (error) {
        console.error(error);
        throw new Error("Unable to create first time user");
      }
    }

    const now = GetCurrentTime("iso");
    const new_login_link = {
      PK: `USER#${user.user_id}`,
      SK: `LOGIN_LINK#${now}`,
      login_link_hash: login_link_hash,
      user_id: user.user_id,
      entity_type: "LOGIN_LINK",
      created_at: now,
      expires_at: login_link_expiry,
      ttl_expiry: GetPastOrFutureTime("future", 1, "days", "unix"),
    };

    const params: PutCommandInput = {
      TableName: DYNAMO_TABLE_NAME,
      Item: new_login_link,
      ConditionExpression: "attribute_not_exists(PK)",
    };

    await Dynamo.send(new PutCommand(params));
    return user;
  } catch (error) {
    throw new Error(`Unable to retrieve user ${error}`);
  }
}
