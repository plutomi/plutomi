import { GetCommandInput, GetCommand } from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../awsClients/ddbDocClient";
import { DYNAMO_TABLE_NAME, ENTITY_TYPES } from "../../Config";
import { DynamoOrg } from "../../types/dynamo";
import { GetOrgInput } from "../../types/main";
import { SdkError } from "@aws-sdk/types";
export default async function GetOrgById(
  props: GetOrgInput
): Promise<[DynamoOrg, null] | [null, SdkError]> {
  // TODO add these types all over the dynamo calls
  const { orgId } = props;
  const params: GetCommandInput = {
    TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,

    Key: {
      PK: `${ENTITY_TYPES.ORG}#${orgId}`,
      SK: ENTITY_TYPES.ORG,
    },
  };

  try {
    const response = await Dynamo.send(new GetCommand(params));
    return [response.Item as DynamoOrg, null];
  } catch (error) {
    return [null, error];
  }
}
