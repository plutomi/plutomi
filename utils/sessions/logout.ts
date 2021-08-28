import { Dynamo } from "../../libs/ddbDocClient";
import { DeleteCommand, DeleteCommandInput } from "@aws-sdk/lib-dynamodb";
import { GetAllSessionsByUserId } from "./getAllSessionsByUserId";
const { DYNAMO_TABLE_NAME } = process.env;
/**
 *
 * @param session_id
 */
export async function Logout(user_id: string) {
  // Deletes all session id's for a given user
  const allSessions = await GetAllSessionsByUserId(user_id);

  console.log("ALL SESSIONS!", allSessions);
  await Promise.all(
    allSessions.map(async (session) => {
      console.log("SESSION!", session);
      let params: DeleteCommandInput = {
        TableName: DYNAMO_TABLE_NAME,
        Key: {
          PK: session.PK,
          SK: session.SK,
        },
      };

      console.log("PARAMS", params.Key);
      try {
        const response = await Dynamo.send(new DeleteCommand(params));
        console.log(response);
        return;
      } catch (error) {
        throw new Error(error);
      }
    })
  );
  console.log("Done mapping");

  return;
}
