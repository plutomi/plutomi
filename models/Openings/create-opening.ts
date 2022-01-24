import {
  TransactWriteCommandInput,
  TransactWriteCommand,
} from "@aws-sdk/lib-dynamodb";
import { nanoid } from "nanoid";
import { Dynamo } from "../../AWSClients/ddbDocClient";
import { ID_LENGTHS, ENTITY_TYPES, TIME_UNITS, DEFAULTS } from "../../Config";
import { DynamoNewOpening } from "../../types/dynamo";
import { CreateOpeningInput } from "../../types/main";
import * as Time from "../../utils/time";
const { DYNAMO_TABLE_NAME } = process.env;
import { SdkError } from "@aws-sdk/types";
export default async function Create(
  props: CreateOpeningInput
): Promise<[DynamoNewOpening, null] | [null, SdkError]> {
  const { orgId, openingName } = props;
  const openingId = nanoid(ID_LENGTHS.OPENING);
  const newOpening: DynamoNewOpening = {
    PK: `${ENTITY_TYPES.ORG}#${orgId}#${ENTITY_TYPES.OPENING}#${openingId}`,
    SK: ENTITY_TYPES.OPENING,
    entityType: ENTITY_TYPES.OPENING,
    createdAt: Time.currentISO(),
    orgId,
    openingId,
    openingName,
    GSI1PK: `${ENTITY_TYPES.ORG}#${orgId}#${ENTITY_TYPES.OPENING}S`,
    GSI1SK: "PRIVATE", // All openings are private by default
    totalStages: 0,
    stageOrder: [],
    totalApplicants: 0,
  };

  // If in dev, set a TTL for auto delete
  if (process.env.NODE_ENV === "development") {
    newOpening["ttlExpiry"] = Time.futureUNIX(
      DEFAULTS.TEST_DATA_RETENTION_PERIOD,
      TIME_UNITS.DAYS
    );
  }
  const transactParams: TransactWriteCommandInput = {
    TransactItems: [
      {
        // Create the opening
        Put: {
          Item: newOpening,
          TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,

          ConditionExpression: "attribute_not_exists(PK)",
        },
      },
      {
        // Increment the org's total openings
        Update: {
          Key: {
            PK: `${ENTITY_TYPES.ORG}#${orgId}`,
            SK: ENTITY_TYPES.ORG,
          },
          TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,

          UpdateExpression:
            "SET totalOpenings = if_not_exists(totalOpenings, :zero) + :value",
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
    return [newOpening, null];
  } catch (error) {
    return [null, error];
  }
}
