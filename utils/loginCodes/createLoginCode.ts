import { PutCommand, PutCommandInput } from "@aws-sdk/lib-dynamodb";
import { GetCurrentTime, GetPastOrFutureTime } from "../time";
import { GetUserByEmail } from "../users/getUserByEmail";
import { Dynamo } from "../../libs/ddbDocClient";
import { CreateUser } from "../users/createUser";

const { DYNAMO_TABLE_NAME } = process.env;

export default async function CreateLoginCode({
  user_email,
  login_code,
  login_code_expiry,
}: CreateLoginCodeInput) {
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
    const new_login_code = {
      PK: `USER#${user.user_id}`,
      SK: `LOGIN_CODE#${now}`,
      login_code: login_code,
      user_id: user.user_id,
      entity_type: "LOGIN_CODE",
      created_at: now,
      expires_at: login_code_expiry,
      is_claimed: false,
      claimed_at: "",
      GSI1PK: user.user_email,
      GSI1SK: `LOGIN_CODE#${now}`,
      ttl_expiry: GetPastOrFutureTime("future", 30, "days", "unix"),
    };

    const params: PutCommandInput = {
      TableName: DYNAMO_TABLE_NAME,
      Item: new_login_code,
      ConditionExpression: "attribute_not_exists(PK)",
    };

    await Dynamo.send(new PutCommand(params));
    return;
  } catch (error) {
    throw new Error(`Unable to retrieve user ${error}`);
  }
  // If user exists, create login code
  // Send login code email
}
