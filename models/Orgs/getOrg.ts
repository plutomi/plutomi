import { GetCommandInput, GetCommand } from '@aws-sdk/lib-dynamodb';
import { Dynamo } from '../../awsClients/ddbDocClient';
import { DYNAMO_TABLE_NAME, Entities } from '../../Config';
import { env } from '../../env';
import { DynamoOrg } from '../../types/dynamo';

interface GetOrgInput {
  orgId: string;
}

export const getOrg = async (props: GetOrgInput): Promise<[DynamoOrg, null] | [null, any]> => {
  const { orgId } = props;
  const params: GetCommandInput = {
    TableName: `${env.deploymentEnvironment}-${DYNAMO_TABLE_NAME}`,
    Key: {
      PK: `${Entities.ORG}#${orgId}`,
      SK: Entities.ORG,
    },
  };

  try {
    const response = await Dynamo.send(new GetCommand(params));
    return [response.Item as DynamoOrg, null];
  } catch (error) {
    return [null, error];
  }
};
