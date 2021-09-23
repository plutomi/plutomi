import { Dynamo } from "../../libs/ddbDocClient";
import { PutCommand, PutCommandInput } from "@aws-sdk/lib-dynamodb";
import { nanoid } from "nanoid";
import { GetCurrentTime } from "../time";
const { DYNAMO_TABLE_NAME } = process.env;
/**
 *
 * @param funnel_name - Name of the funnel (NYC, Miami, Houston, Job's Program, After School)
 * @param org_id
 */
export async function CreateFunnel({ org_id, funnel_name }: CreateFunnelInput) {
  const now = GetCurrentTime("iso");
  const funnel_id = nanoid(10);
  const new_funnel = {
    PK: `ORG#${org_id}#FUNNEL#${funnel_id}`,
    SK: `FUNNEL`,
    funnel_name: funnel_name,
    entity_type: "FUNNEL",
    created_at: now,
    funnel_id: funnel_id,
    GSI1PK: `ORG#${org_id}#FUNNELS`,
    GSI1SK: funnel_name,
  };

  const params: PutCommandInput = {
    TableName: DYNAMO_TABLE_NAME,
    Item: new_funnel,
  };

  try {
    await Dynamo.send(new PutCommand(params));
    return new_funnel;
  } catch (error) {
    throw new Error(error);
  }
}
