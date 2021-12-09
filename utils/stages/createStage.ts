import {
  TransactWriteCommand,
  TransactWriteCommandInput,
} from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../awsClients/ddbDocClient";
import * as Time from "../time";
import { nanoid } from "nanoid";
import { ENTITY_TYPES, ERRORS, ID_LENGTHS, LIMITS } from "../../Config";
import { CreateStageInput } from "../../types/main";
import { DynamoNewStage } from "../../types/dynamo";

const { DYNAMO_TABLE_NAME } = process.env;

export async function createStage(props: CreateStageInput): Promise<void> {
  const { orgId, GSI1SK, openingId } = props;
  const stageId = nanoid(ID_LENGTHS.STAGE);
  const newStage: DynamoNewStage = {
    // TODO fix this type
    PK: `${ENTITY_TYPES.ORG}#${orgId}#${ENTITY_TYPES.STAGE}#${stageId}`,
    SK: ENTITY_TYPES.STAGE,
    entityType: ENTITY_TYPES.STAGE,
    createdAt: Time.currentISO(),
    questionOrder: [],
    stageId: stageId,
    orgId: orgId,
    totalApplicants: 0,
    openingId: openingId,
    GSI1PK: `${ENTITY_TYPES.ORG}#${orgId}#${ENTITY_TYPES.OPENING}#${openingId}#STAGES`, // Get all stages in an opening
    GSI1SK: GSI1SK,
  };

  try {
    // TODO this should not be here, this should be in controller
    let opening = await getOpening({ orgId, openingId });

    try {
      // Get current opening
      opening.stageOrder.push(stageId);

      if (opening.stageOrder.length >= LIMITS.MAX_CHILD_ENTITY_LIMIT) {
        throw ERRORS.MAX_CHILD_ENTITY_LIMIT_ERROR_MESSAGE;
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
                PK: `${ENTITY_TYPES.ORG}#${orgId}#${ENTITY_TYPES.OPENING}#${openingId}`,
                SK: ENTITY_TYPES.OPENING,
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
                PK: `${ENTITY_TYPES.ORG}#${orgId}`,
                SK: ENTITY_TYPES.ORG,
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
      `Unable to retrieve opening where stage should be added ${error}` // TODO add to errors
    );
  }
}
