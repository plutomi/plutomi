import { GetCommandInput, GetCommand } from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../awsClients/ddbDocClient";
import { ENTITY_TYPES } from "../../Config";
import { DynamoNewOpening } from "../../types/dynamo";
import { GetOpeningByIdInput } from "../../types/main";
const { DYNAMO_TABLE_NAME } = process.env;
import { SdkError } from "@aws-sdk/types";
export default async function Get(
  props: GetOpeningByIdInput
): Promise<[DynamoNewOpening, null] | [null, SdkError]> {
  const { orgId, openingId } = props;
  const params: GetCommandInput = {
    TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,

    Key: {
      PK: `${ENTITY_TYPES.ORG}#${orgId}#${ENTITY_TYPES.OPENING}#${openingId}`,
      SK: ENTITY_TYPES.OPENING,
    },
  };

  try {
    const response = await Dynamo.send(new GetCommand(params));
    return [response.Item as DynamoNewOpening, null];
  } catch (error) {
    return [null, error];
  }
}
