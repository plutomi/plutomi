import {
  TransactWriteCommand,
  TransactWriteCommandInput,
} from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../libs/ddbDocClient";
import { GetCurrentTime } from "../time";
import { nanoid } from "nanoid";
import { GetOpening } from "../openings/getOpeningById";

const { DYNAMO_TABLE_NAME } = process.env;

export async function CreateStage({
  org_id,
  GSI1SK,
  opening_id,
}: CreateStageInput) {
  const now = GetCurrentTime("iso");
  const stage_id = nanoid(16);
  const new_stage = {
    PK: `ORG#${org_id}#OPENING#${opening_id}#STAGE#${stage_id}`,
    SK: `STAGE`,
    entity_type: "STAGE",
    created_at: now,
    question_order: [],
    stage_id: stage_id,
    opening_id: opening_id,
    GSI1PK: `ORG#${org_id}#OPENING#${opening_id}#STAGES`, // Get all stages in an opening
    GSI1SK: GSI1SK,
  };

  try {
    let opening = await GetOpening({ org_id, opening_id });

    try {
      // Get current opening
      opening.stage_order.push(stage_id);

      const transactParams: TransactWriteCommandInput = {
        TransactItems: [
          {
            // Add a stage item
            Put: {
              Item: new_stage,
              TableName: DYNAMO_TABLE_NAME,
              ConditionExpression: "attribute_not_exists(PK)",
            },
          },
          {
            // Add stage to the opening
            Update: {
              Key: {
                PK: `ORG#${org_id}#OPENING#${opening_id}`,
                SK: `OPENING`,
              },
              TableName: DYNAMO_TABLE_NAME,
              UpdateExpression: "SET stage_order = :stage_order",
              ExpressionAttributeValues: {
                ":stage_order": opening.stage_order,
              },
            },
          },
        ],
      };

      await Dynamo.send(new TransactWriteCommand(transactParams));
    } catch (error) {
      throw new Error(error);
    }
  } catch (error) {
    throw new Error(
      `Unable to retrieve opening where stage should be added ${error}`
    );
  }
}
