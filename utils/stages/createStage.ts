import {
  TransactWriteCommand,
  TransactWriteCommandInput,
} from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../libs/ddbDocClient";
import { GetCurrentTime } from "../time";
import { nanoid } from "nanoid";
import { GetOpening } from "../openings/getOpeningById";
import { MAX_CHILD_ITEM_LIMIT, MAX_ITEM_LIMIT_ERROR } from "../../Config";

const { DYNAMO_TABLE_NAME } = process.env;

export async function CreateStage({
  org_id,
  GSI1SK,
  opening_id,
}: DynamoCreateStageInput) {
  const now = GetCurrentTime("iso") as string;
  const stage_id = nanoid(50);
  const new_stage = {
    PK: `ORG#${org_id}#STAGE#${stage_id}`,
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

      if (opening.stage_order.length >= MAX_CHILD_ITEM_LIMIT) {
        throw MAX_ITEM_LIMIT_ERROR;
      }

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
