import {
  TransactWriteCommand,
  TransactWriteCommandInput,
} from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../awsClients/ddbDocClient";
import { GetCurrentTime } from "../time";
import { nanoid } from "nanoid";
import { GetOpening } from "../openings/getOpeningById";
import { MAX_CHILD_ITEM_LIMIT, MAX_ITEM_LIMIT_ERROR } from "../../Config";

const { DYNAMO_TABLE_NAME } = process.env;

export async function CreateStage({
  orgId,
  GSI1SK,
  openingId,
}: DynamoCreateStageInput) {
  const now = GetCurrentTime("iso") as string;
  const stageId = nanoid(50);
  const new_stage = {
    PK: `ORG#${orgId}#STAGE#${stageId}`,
    SK: `STAGE`,
    entityType: "STAGE",
    createdAt: now,
    questionOrder: [],
    stageId: stageId,
    totalApplicants: 0,
    openingId: openingId,
    GSI1PK: `ORG#${orgId}#OPENING#${openingId}#STAGES`, // Get all stages in an opening
    GSI1SK: GSI1SK,
  };

  try {
    let opening = await GetOpening({ orgId, openingId });

    try {
      // Get current opening
      opening.stageOrder.push(stageId);

      if (opening.stageOrder.length >= MAX_CHILD_ITEM_LIMIT) {
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
            // Add stage to the opening + increment stage count on opening
            Update: {
              Key: {
                PK: `ORG#${orgId}#OPENING#${openingId}`,
                SK: `OPENING`,
              },
              TableName: DYNAMO_TABLE_NAME,

              UpdateExpression:
                "SET stageOrder = :stageOrder, totalStages = if_not_exists(totalStages, :zero) + :value",
              ExpressionAttributeValues: {
                ":stageOrder": opening.stageOrder,
                ":zero": 0,
                ":value": 1,
              },
            },
          },
          {
            // Increment stage count on org
            Update: {
              Key: {
                PK: `ORG#${orgId}`,
                SK: `ORG`,
              },
              TableName: DYNAMO_TABLE_NAME,
              UpdateExpression:
                "SET totalStages = if_not_exists(totalStages, :zero) + :value",
              ExpressionAttributeValues: {
                ":zero": 0,
                ":value": 1,
              },
            },
          },
        ],
      };

      await Dynamo.send(new TransactWriteCommand(transactParams));
    } catch (error) {
      console.error(error);
      throw new Error(error);
    }
  } catch (error) {
    throw new Error(
      `Unable to retrieve opening where stage should be added ${error}`
    );
  }
}
