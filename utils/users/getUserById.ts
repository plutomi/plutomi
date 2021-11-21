import { GetCommand, GetCommandInput } from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../awsClients/ddbDocClient";
import { ENTITY_TYPES } from "../../Config";
import { DynamoNewUser } from "../../types/dynamo";
import { GetUserByIdInput } from "../../types/main";

const { DYNAMO_TABLE_NAME } = process.env;

/**
 * Returns a user's metadata
 * @param userId The userId you want to find
 * @returns - {@link DynamoNewUser}
 */
export async function getUserById(
  props: GetUserByIdInput
): Promise<DynamoNewUser> {
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
}
