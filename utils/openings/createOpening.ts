import {
  PutCommand,
  PutCommandInput,
  TransactWriteCommand,
  TransactWriteCommandInput,
} from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../lib/awsClients/ddbDocClient";
import { getCurrentTime } from "../time";
import { nanoid } from "nanoid";

const { DYNAMO_TABLE_NAME } = process.env;

export async function CreateOpening({ orgId, GSI1SK }: CreateOpeningInput) {
  const now = getCurrentTime("iso") as string;
  const opening_id = nanoid(16);
  const new_opening: DynamoOpening = {
    PK: `ORG#${orgId}#OPENING#${opening_id}`,
    SK: `OPENING`,
    entityType: "OPENING",
    created_at: now,
    opening_id: opening_id,
    GSI1PK: `ORG#${orgId}#OPENINGS`,
    GSI1SK: GSI1SK,
    total_stages: 0,
    total_openings: 0,
    total_applicants: 0,
    is_public: false,
    stage_order: [],
  };

  const transactParams: TransactWriteCommandInput = {
    TransactItems: [
      {
        // Create the opening
        Put: {
          Item: new_opening,
          TableName: DYNAMO_TABLE_NAME,
          ConditionExpression: "attribute_not_exists(PK)",
        },
      },
      {
        // Increment the org's total openings
        Update: {
          Key: {
            PK: `ORG#${orgId}`,
            SK: `ORG`,
          },
          TableName: DYNAMO_TABLE_NAME,
          UpdateExpression:
            "SET total_openings = if_not_exists(total_openings, :zero) + :value",
          ExpressionAttributeValues: {
            ":zero": 0,
            ":value": 1,
          },
        },
      },
    ],
  };

  try {
    await Dynamo.send(new TransactWriteCommand(transactParams));
    return new_opening;
  } catch (error) {
    throw new Error(error);
  }
}
