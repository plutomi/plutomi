import { PutCommand, PutCommandInput } from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../libs/ddbDocClient";
import { GetCurrentTime } from "../time";
import { nanoid } from "nanoid";

const { DYNAMO_TABLE_NAME } = process.env;

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
