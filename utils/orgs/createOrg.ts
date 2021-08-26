import { Dynamo } from "../../libs/ddbDocClient";
import { PutCommand, PutCommandInput } from "@aws-sdk/lib-dynamodb";
import dayjs from "dayjs";
import { nanoid } from "nanoid";
const { DYNAMO_TABLE_NAME } = process.env;
/**
 *
 * @param org_name
 */
export async function CreateStageRule(org_name: string) {
  const now = dayjs().toISOString();
  const org_id = nanoid(30);
  const new_org = {
    PK: `ORG#${org_id}`,
    SK: `ORG`,
    entity_type: "ORG",
    created_at: now,
    GSI1PK: `ORG`, // No need to add an extra index, can query from here to get all orgs!
    GSI1SK: `ORG#${org_id}`,
  };

  const params: PutCommandInput = {
    TableName: DYNAMO_TABLE_NAME,
    Item: new_org,
  };

  try {
    await Dynamo.send(new PutCommand(params));
    return new_org;
  } catch (error) {
    throw new Error(error);
  }
}
