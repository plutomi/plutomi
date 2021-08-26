import { Dynamo } from "../../libs/ddbDocClient";
import { PutCommand, PutCommandInput } from "@aws-sdk/lib-dynamodb";
import dayjs from "dayjs";
import { CreatePassword } from "../passwords";
import { nanoid } from "nanoid";
const { DYNAMO_TABLE_NAME } = process.env;
/**
 *
 * @param name - Name of the funnel (NYC, Miami, Houston)
 * @param org_id - ID of org
 */
export async function CreateFunnel(org_id: string, name: string) {
  const now = dayjs().toISOString();
  const funnel_id = nanoid(30);
  const new_user = {
    PK: `ORG#${org_id}#FUNNEL#${funnel_id}`,
    SK: `FUNNEL`,
    name: name,
    entity_type: "FUNNEL",
    created_at: now,
    funnel_id: funnel_id,
    GSI1PK: `ORG#${org_id}#FUNNELS`,
    GSI1SK: name,
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
