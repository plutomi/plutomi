import {
  PutCommand,
  PutCommandInput,
  TransactWriteCommand,
  TransactWriteCommandInput,
} from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../awsClients/ddbDocClient";
import Time from "../time";
import { nanoid } from "nanoid";
import { ENTITY_TYPES, ID_LENGTHS } from "../../defaults";
import { DynamoNewOpening } from "../../types/dynamo";
import { CreateOpeningInput } from "../../types/main";

const { DYNAMO_TABLE_NAME } = process.env;

export async function createOpening(
  props: CreateOpeningInput
): Promise<DynamoNewOpening> {
  const { orgId, GSI1SK } = props;
  const openingId = nanoid(ID_LENGTHS.OPENING);
  const newOpening: DynamoNewOpening = {
    PK: `${ENTITY_TYPES.ORG}#${orgId}#${ENTITY_TYPES.OPENING}#${openingId}`,
    SK: ENTITY_TYPES.OPENING,
    entityType: ENTITY_TYPES.OPENING,
    createdAt: Time.currentISO(),
    orgId: orgId,
    openingId: openingId,
    GSI1PK: `${ENTITY_TYPES.ORG}#${orgId}#${ENTITY_TYPES.OPENING}S`,
    GSI1SK: GSI1SK,
    totalStages: 0,
    totalApplicants: 0,
    isPublic: false,
    stageOrder: [],
  };

  const transactParams: TransactWriteCommandInput = {
    TransactItems: [
      {
        // Create the opening
        Put: {
          Item: newOpening,
          TableName: DYNAMO_TABLE_NAME,
          ConditionExpression: "attribute_not_exists(PK)",
        },
      },
      {
        // Increment the org's total openings
        Update: {
          Key: {
            PK: `${ENTITY_TYPES.ORG}#${orgId}`,
            SK: `${ENTITY_TYPES.ORG}`,
          },
          TableName: DYNAMO_TABLE_NAME,
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
    return newOpening;
  } catch (error) {
    throw new Error(error);
  }
}
