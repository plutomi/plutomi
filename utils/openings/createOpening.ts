import { PutCommand, PutCommandInput } from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../libs/ddbDocClient";
import { GetCurrentTime } from "../time";
import { nanoid } from "nanoid";

const { DYNAMO_TABLE_NAME } = process.env;

export async function CreateOpening({ org_id, GSI1SK }: CreateOpeningInput) {
  const now = GetCurrentTime("iso") as string;
  const opening_id = nanoid(16);
  const new_opening = {
    PK: `ORG#${org_id}#OPENING#${opening_id}`,
    SK: `OPENING`,
    entity_type: "OPENING",
    created_at: now,
    opening_id: opening_id,
    GSI1PK: `ORG#${org_id}#OPENINGS`,
    GSI1SK: GSI1SK,
    total_stages: 0,
    total_openings: 0,
    total_applicants: 0,
    is_public: false,
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
