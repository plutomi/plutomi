import { Dynamo } from "../../libs/ddbDocClient";
import {
  DeleteCommand,
  DeleteCommandInput,
  PutCommand,
  PutCommandInput,
} from "@aws-sdk/lib-dynamodb";
import { GetAllSessionsByUserId } from "./getAllSessionsByUserId";
const { DYNAMO_TABLE_NAME } = process.env;
import dayjs, { Dayjs } from "dayjs";
/**
 *
 * @param session_id
 */
export async function Logout(user_id: string) {
  // Deletes all session id's for a given user
  const allSessions = await GetAllSessionsByUserId(user_id);

  const now = dayjs();
  const current_time = now.toISOString();
  const logout_params: PutCommandInput = {
    TableName: DYNAMO_TABLE_NAME,
    Item: {
      PK: `USER#${user_id}`,
      SK: `USER_LOGOUT#${current_time}`, // TODO add TTL expiry???
      entity_type: "LOGIN",
      created_at: current_time,
      user_id: user_id,
    },
    ConditionExpression: "attribute_not_exists(PK)", // Shouldn't be needed
  };

  // Mark the logout
  await Dynamo.send(new PutCommand(logout_params));

  // Delete all sessions
  await Promise.all(
    allSessions.map(async (session) => {
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
