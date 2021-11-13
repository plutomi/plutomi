import { GetCommand, GetCommandInput } from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../awsClients/ddbDocClient";
const { DYNAMO_TABLE_NAME } = process.env;

export async function getOpening({ orgId, openingId }) {
  const params: GetCommandInput = {
    TableName: DYNAMO_TABLE_NAME,
    Key: {
      PK: `ORG#${orgId}#OPENING#${openingId}`,
      SK: `OPENING`,
    },
  };

  try {
    const response = await Dynamo.send(new GetCommand(params));
    return response.Item;
  } catch (error) {
    throw new Error(error);
  }
}
