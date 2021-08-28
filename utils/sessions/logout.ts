import { Dynamo } from "../../libs/ddbDocClient";
import {
  DeleteCommand,
  DeleteCommandInput,
  PutCommand,
  PutCommandInput,
} from "@aws-sdk/lib-dynamodb";
import { GetAllSessionsByUserId } from "./getAllSessionsByUserId";
import { GetCurrentTime } from "../time";
const { DYNAMO_TABLE_NAME } = process.env;

/**
 * @param user_id
 */
export async function Logout(user_id: string) {
  const all_user_sessions = await GetAllSessionsByUserId(user_id);

  const current_time = GetCurrentTime("iso");
  const logout_params: PutCommandInput = {
    TableName: DYNAMO_TABLE_NAME,
    Item: {
      PK: `USER#${user_id}`,
      SK: `USER_LOGOUT#${current_time}`, // TODO add TTL expiry???
      entity_type: "LOGOUT",
      created_at: current_time,
      user_id: user_id,
    },
    ConditionExpression: "attribute_not_exists(PK)", // Shouldn't be needed
  };

  // Mark the logout
  await Dynamo.send(new PutCommand(logout_params));

  // Delete all sessions for a given user
  await Promise.all(
    all_user_sessions.map(async (session) => {
      let params: DeleteCommandInput = {
        TableName: DYNAMO_TABLE_NAME,
        Key: {
          PK: session.PK,
          SK: session.SK,
        },
      };

      try {
        await Dynamo.send(new DeleteCommand(params));
        return;
      } catch (error) {
        throw new Error(error);
      }
    })
  );

  return;
}
