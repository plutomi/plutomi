import { GetCommand, GetCommandInput } from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../lib/awsClients/ddbDocClient";

const { DYNAMO_TABLE_NAME } = process.env;

export async function GetStage({ org_id, stage_id }: GetStageInput) {
  const params: GetCommandInput = {
    TableName: DYNAMO_TABLE_NAME,
    Key: {
      PK: `ORG#${org_id}#STAGE#${stage_id}`,
      SK: `STAGE`,
    },
  };

  try {
    const response = await Dynamo.send(new GetCommand(params));
    return response.Item;
  } catch (error) {
    throw new Error(error);
  }
}
