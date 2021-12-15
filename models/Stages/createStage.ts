import {
  TransactWriteCommandInput,
  TransactWriteCommand,
} from "@aws-sdk/lib-dynamodb";
import { nanoid } from "nanoid";
import { Dynamo } from "../../awsClients/ddbDocClient";
import { ID_LENGTHS, ENTITY_TYPES, LIMITS, ERRORS } from "../../Config";
import { DynamoNewStage } from "../../types/dynamo";
import { CreateStageInput } from "../../types/main";
import getOpening from "../Openings/getOpening";
import * as Time from "../../utils/time";
const { DYNAMO_TABLE_NAME } = process.env;
import { SdkError } from "@aws-sdk/types";
export default async function Create(
  props: CreateStageInput
): Promise<[null, null] | [null, SdkError]> {
  const { orgId, GSI1SK, openingId, stageOrder } = props;
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
    // Get current opening
    stageOrder.push(stageId);

    if (stageOrder.length >= LIMITS.MAX_CHILD_ENTITY_LIMIT) {
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
              ":stageOrder": stageOrder,
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
    return [null, null];
  } catch (error) {
    return [null, error];
  }
}
