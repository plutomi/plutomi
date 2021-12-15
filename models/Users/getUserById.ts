import { GetCommandInput, GetCommand } from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../awsClients/ddbDocClient";
import { ENTITY_TYPES } from "../../Config";
import { DynamoNewUser } from "../../types/dynamo";
import { GetUserByIdInput } from "../../types/main";
const { DYNAMO_TABLE_NAME } = process.env;
import { SdkError } from "@aws-sdk/types";
/**
 * Returns a user's metadata
 * @param userId The userId you want to find
 * @returns - {@link DynamoNewUser}
 */
export default async function GetById(
  props: GetUserByIdInput
): Promise<[DynamoNewUser, null] | [null, SdkError]> {
  const { userId } = props;
  const params: GetCommandInput = {
    TableName: DYNAMO_TABLE_NAME + "a",
    Key: {
      PK: `${ENTITY_TYPES.USER}#${userId}`,
      SK: ENTITY_TYPES.USER,
    },
  };

  try {
    const response = await Dynamo.send(new GetCommand(params));
    return [response.Item as DynamoNewUser, null];
  } catch (error) {
    return [null, error];
  }
}
