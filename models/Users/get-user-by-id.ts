import { GetCommandInput, GetCommand } from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../AWSClients/ddbDocClient";
import { ENTITY_TYPES } from "../../Config";
import { DynamoUser } from "../../types/dynamo";
import { GetUserByIdInput } from "../../types/main";
const { DYNAMO_TABLE_NAME } = process.env;
import { SdkError } from "@aws-sdk/types";
/**
 * Returns a user's metadata
 * @param userId The userId you want to find
 * @returns - {@link DynamoUser}
 */
export default async function GetById(
  props: GetUserByIdInput
): Promise<[DynamoUser, null] | [null, SdkError]> {
  const { userId } = props;
  const params: GetCommandInput = {
    TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,

    Key: {
      PK: `${ENTITY_TYPES.USER}#${userId}`,
      SK: ENTITY_TYPES.USER,
    },
  };

  try {
    const response = await Dynamo.send(new GetCommand(params));
    return [response.Item as DynamoUser, null];
  } catch (error) {
    return [null, error];
  }
}
