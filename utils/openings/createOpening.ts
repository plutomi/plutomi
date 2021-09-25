import { PutCommand, PutCommandInput } from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../libs/ddbDocClient";
import { GetCurrentTime } from "../time";
import { nanoid } from "nanoid";

const { DYNAMO_TABLE_NAME } = process.env;

export async function CreateOpening({
  org_id,
  opening_name,
  is_public,
}: CreateOpeningInput) {
  const now = GetCurrentTime("iso");
  const opening_id = nanoid(10);
  const new_opening: DynamoOpening = {
    PK: `ORG#${org_id}#OPENING#${opening_id}`,
    SK: `OPENING`,
    opening_name: opening_name,
    entity_type: "OPENING",
    created_at: now as string,
    opening_id: opening_id,
    GSI1PK: `ORG#${org_id}#OPENINGS`,
    GSI1SK: opening_name,
    is_public: is_public,
    stage_order: [],
  };

  const params: PutCommandInput = {
    TableName: DYNAMO_TABLE_NAME,
    Item: new_opening,
  };

  try {
    await Dynamo.send(new PutCommand(params));
    return new_opening;
  } catch (error) {
    throw new Error(error);
  }
}
