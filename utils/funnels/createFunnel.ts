import { Dynamo } from "../../libs/ddbDocClient";
import { PutCommand, PutCommandInput } from "@aws-sdk/lib-dynamodb";
import { nanoid } from "nanoid";
import { GetCurrentTime } from "../time";
const { DYNAMO_TABLE_NAME } = process.env;
/**
 *
 * @param funnel_name - Name of the funnel (NYC, Miami, Houston, Job's Program, After School (Address Here))
 * @param org_url_name
 */
export async function CreateFunnel(org_url_name: string, funnel_name: string) {
  const now = GetCurrentTime("iso");

  const funnel_id = nanoid(30);
  const new_user = {
    PK: `ORG#${org_url_name}#FUNNEL#${funnel_id}`,
    SK: `FUNNEL`,
    funnel_name: funnel_name,
    entity_type: "FUNNEL",
    created_at: now,
    funnel_id: funnel_id,
    GSI1PK: `ORG#${org_url_name}#FUNNELS`,
    GSI1SK: funnel_name,
  };

  const params: PutCommandInput = {
    TableName: DYNAMO_TABLE_NAME,
    Item: new_user,
  };

  try {
    await Dynamo.send(new PutCommand(params));
    return new_user;
  } catch (error) {
    throw new Error(error);
  }
}
