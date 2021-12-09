import { GetCommandInput, GetCommand } from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../awsClients/ddbDocClient";
import { ENTITY_TYPES } from "../../Config";
import { DynamoNewOpening } from "../../types/dynamo";
import { GetOpeningByIdInput } from "../../types/main";
const { DYNAMO_TABLE_NAME } = process.env;

export default async function get(
  props: GetOpeningByIdInput
): Promise<DynamoNewOpening> {
  const { orgId, openingId } = props;
  const params: GetCommandInput = {
    TableName: DYNAMO_TABLE_NAME,
    Key: {
      PK: `${ENTITY_TYPES.ORG}#${orgId}#${ENTITY_TYPES.OPENING}#${openingId}`,
      SK: ENTITY_TYPES.OPENING,
    },
  };

  try {
    const response = await Dynamo.send(new GetCommand(params));
    return response.Item as DynamoNewOpening;
  } catch (error) {
    throw new Error(error);
  }
}
