import { GetCommand, GetCommandInput } from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../awsClients/ddbDocClient";
import { ENTITY_TYPES } from "../../defaults";
import { DynamoNewUser } from "../../types/dynamo";

const { DYNAMO_TABLE_NAME } = process.env;

/**
 * Returns a user's metadata
 * @param userId The userId you want to find
 * @returns {@link DynamoNewUser}
 */
export async function getUserById(userId: string): Promise<DynamoNewUser> {
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
}
