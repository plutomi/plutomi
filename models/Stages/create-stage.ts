import {
  TransactWriteCommandInput,
  TransactWriteCommand,
} from "@aws-sdk/lib-dynamodb";
import { nanoid } from "nanoid";
import getNewChildItemOrder from "../../utils/getNewChildItemOrder";
import { Dynamo } from "../../AWSClients/ddbDocClient";
import { ID_LENGTHS, ENTITY_TYPES, LIMITS } from "../../Config";
import { DynamoStage } from "../../types/dynamo";
import { CreateStageInput } from "../../types/main";
import * as Time from "../../utils/time";
const { DYNAMO_TABLE_NAME } = process.env;
import { SdkError } from "@aws-sdk/types";
export default async function CreateStage(
  props: CreateStageInput
): Promise<[null, null] | [null, SdkError]> {
  const { orgId, GSI1SK, openingId, position, stageOrder } = props;
  const stageId = nanoid(ID_LENGTHS.STAGE);
  const newStage: DynamoStage = {
    PK: `${ENTITY_TYPES.ORG}#${orgId}#${ENTITY_TYPES.OPENING}#${openingId}#${ENTITY_TYPES.STAGE}#${stageId}`,
    SK: ENTITY_TYPES.STAGE,
    entityType: ENTITY_TYPES.STAGE,
    createdAt: Time.currentISO(),
    stageId,
    questionOrder: [],
    orgId,
    totalApplicants: 0,
    openingId,
    GSI1PK: `${ENTITY_TYPES.ORG}#${orgId}#${ENTITY_TYPES.OPENING}#${openingId}#${ENTITY_TYPES.STAGE}S`, // Get all stages in an opening
    GSI1SK,
  };

  const newStageOrder = getNewChildItemOrder(stageId, stageOrder, position);

  try {
    let transactParams: TransactWriteCommandInput = {
      TransactItems: [
        {
          // Add the new stage
          Put: {
            Item: newStage,
            TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,
            ConditionExpression: "attribute_not_exists(PK)",
          },
        },
        {
          // Increment stage count on the opening and update the newStageOrder
          Update: {
            Key: {
              PK: `${ENTITY_TYPES.ORG}#${orgId}#${ENTITY_TYPES.OPENING}#${openingId}`,
              SK: ENTITY_TYPES.OPENING,
            },
            TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,

            ConditionExpression:
              "totalStages < :maxChildItemLimit AND attribute_exists(PK)",
            UpdateExpression:
              "SET totalStages = if_not_exists(totalStages, :zero) + :value, stageOrder = :stageOrder",
            ExpressionAttributeValues: {
              ":zero": 0,
              ":value": 1,
              ":stageOrder": newStageOrder,
              ":maxChildItemLimit": LIMITS.MAX_CHILD_ITEM_LIMIT,
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
