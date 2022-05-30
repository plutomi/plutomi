import { GetCommandInput, GetCommand } from '@aws-sdk/lib-dynamodb';
import { SdkError } from '@aws-sdk/types';
import { Dynamo } from '../../awsClients/ddbDocClient';
import { DYNAMO_TABLE_NAME, Entities } from '../../Config';
import { DynamoOpening } from '../../types/dynamo';
import { GetOpeningByIdInput } from '../../types/main';

export default async function GetOpeningById(
  props: GetOpeningByIdInput,
): Promise<[DynamoOpening, null] | [null, SdkError]> {
  const { orgId, openingId } = props;
  const params: GetCommandInput = {
    TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,
    Key: {
      PK: `${Entities.ORG}#${orgId}#${Entities.OPENING}#${openingId}`,
      SK: Entities.OPENING,
    },
  };

  try {
    const response = await Dynamo.send(new GetCommand(params));
    return [response.Item as DynamoOpening, null];
  } catch (error) {
    return [null, error];
  }
}
