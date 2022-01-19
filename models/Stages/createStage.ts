import {
  TransactWriteCommandInput,
  TransactWriteCommand,
} from "@aws-sdk/lib-dynamodb";
import { nanoid } from "nanoid";
import { Dynamo } from "../../awsClients/ddbDocClient";
import { ID_LENGTHS, ENTITY_TYPES, DEFAULTS } from "../../Config";
import { DynamoNewStage } from "../../types/dynamo";
import { CreateStageInput } from "../../types/main";
import * as Time from "../../utils/time";
const { DYNAMO_TABLE_NAME } = process.env;
import { SdkError } from "@aws-sdk/types";
export default async function Create(
  props: CreateStageInput
): Promise<[null, null] | [null, SdkError]> {
  const { orgId, GSI1SK, openingId, position } = props;
  const stageId = nanoid(ID_LENGTHS.STAGE);
  const newStage: DynamoNewStage = {
    PK: `${ENTITY_TYPES.ORG}#${orgId}#${ENTITY_TYPES.OPENING}#${openingId}#${ENTITY_TYPES.STAGE}#${stageId}`,
    SK: ENTITY_TYPES.STAGE,
    entityType: ENTITY_TYPES.STAGE,
    createdAt: Time.currentISO(),
    stageId,
    orgId,
    totalApplicants: 0,
    openingId,
    GSI1PK: `${ENTITY_TYPES.ORG}#${orgId}#${ENTITY_TYPES.OPENING}#${openingId}#STAGES`, // Get all stages in an opening
    GSI1SK: GSI1SK,
  };

  /**
   * Position can be undefined, and if so, add it to the end of the opening
   * Joi checks for out of range values
   * So all we have to do is make sure this value is a number
   * as checking for if (position) {} would return falsy on '0'
   */

  const newPosition = !isNaN(position) ? position : props.stageOrder.length;
  props.stageOrder.splice(newPosition, 0, stageId);

  try {
    let transactParams: TransactWriteCommandInput = {
      TransactItems: [
        {
          // Add the new stage
          Put: {
            Item: newStage,
            TableName: DYNAMO_TABLE_NAME,
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
            TableName: DYNAMO_TABLE_NAME,
            ConditionExpression:
              "totalStages < :maxChildItemLimit AND attribute_exists(PK)",
            UpdateExpression:
              "SET totalStages = if_not_exists(totalStages, :zero) + :value, stageOrder = :stageOrder",
            ExpressionAttributeValues: {
              ":zero": 0,
              ":value": 1,
              ":stageOrder": props.stageOrder,
              ":maxChildItemLimit": DEFAULTS.MAX_CHILD_ITEM_LIMIT,
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
