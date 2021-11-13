import {
  PutCommand,
  PutCommandInput,
  TransactWriteCommand,
  TransactWriteCommandInput,
} from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../awsClients/ddbDocClient";
import { GetCurrentTime } from "../time";
import { nanoid } from "nanoid";

const { DYNAMO_TABLE_NAME } = process.env;

export async function createOpening({ orgId, GSI1SK }) {
  const now = Time.currentISO() as string;
  const openingId = nanoid(16);
  const newOpening = {
    PK: `ORG#${orgId}#OPENING#${openingId}`,
    SK: `OPENING`,
    entityType: "OPENING",
    createdAt: now,
    openingId: openingId,
    GSI1PK: `ORG#${orgId}#OPENINGS`,
    GSI1SK: GSI1SK,
    totalStages: 0,
    totalOpenings: 0,
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
            PK: `ORG#${orgId}`,
            SK: `ORG`,
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
