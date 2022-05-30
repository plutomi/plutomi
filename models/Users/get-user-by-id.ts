import { GetCommandInput, GetCommand } from '@aws-sdk/lib-dynamodb';
import { SdkError } from '@aws-sdk/types';
import { Dynamo } from '../../awsClients/ddbDocClient';
import { DYNAMO_TABLE_NAME, Entities } from '../../Config';
import { DynamoUser } from '../../types/dynamo';
import { GetUserByIdInput } from '../../types/main';
/**
 * Returns a user's metadata
 * @param userId The userId you want to find
 * @returns - {@link DynamoUser}
 */
export default async function GetUserById(
  props: GetUserByIdInput,
): Promise<[DynamoUser, null] | [null, SdkError]> {
  const { userId } = props;
  const params: GetCommandInput = {
    TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,

    Key: {
      PK: `${Entities.USER}#${userId}`,
      SK: Entities.USER,
    },
  };

  try {
    const response = await Dynamo.send(new GetCommand(params));
    return [response.Item as DynamoUser, null];
  } catch (error) {
    return [null, error];
  }
}
