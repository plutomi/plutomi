import {
  TransactWriteCommand,
  TransactWriteCommandInput,
} from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../awsClients/ddbDocClient";
import Time from "../time";
import { nanoid } from "nanoid";
import { getOpening } from "../openings/getOpeningById";

const { DYNAMO_TABLE_NAME } = process.env;

export async function createStage(props: CreateStageInput): Promise<void> {
  const { orgId, GSI1SK, openingId } = props;
  const now = Time.currentISO();
  const stageId = nanoid(50);
  const newStage: StagesDynamoEntry = {
    PK: `ORG#${orgId}#STAGE#${stageId}`,
    SK: ENTITY_TYPES.STAGE,
    entityType: ENTITY_TYPES.STAGE,
    createdAt: now,
    questionOrder: [],
    stageId: stageId,
    totalApplicants: 0,
    openingId: openingId,
    GSI1PK: `ORG#${orgId}#OPENING#${openingId}#STAGES`, // Get all stages in an opening
    GSI1SK: GSI1SK,
  };

  try {
    let opening = await getOpening({ orgId, openingId });

    try {
      // Get current opening
      opening.stageOrder.push(stageId);

      if (opening.stageOrder.length >= Limits.MAX_CHILD_ITEM_LIMIT) {
        throw ERRORS.MAX_CHILD_ITEM_LIMIT_ERROR_MESSAGE;
      }

      const transactParams: TransactWriteCommandInput = {
        TransactItems: [
          {
            // Add a stage item
            Put: {
              Item: newStage,
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
      return;
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
