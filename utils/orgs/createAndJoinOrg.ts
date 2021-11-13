import {
  TransactWriteCommand,
  TransactWriteCommandInput,
} from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../awsClients/ddbDocClient";
import { GetCurrentTime } from "../time";

const { DYNAMO_TABLE_NAME } = process.env;

export async function createAndJoinOrg({ userId, orgId, GSI1SK }) {
  const now = GetCurrentTime("iso") as string;

  const newOrg = {
    PK: `ORG#${orgId}`,
    SK: `ORG`,
    orgId: orgId, // plutomi - Cannot be changed
    entityType: "ORG",
    createdAt: now,
    totalApplicants: 0,
    totalOpenings: 0,
    totalStages: 0,
    totalUsers: 1,
    GSI1PK: `ORG`, // Allows for 'get all orgs' query
    // but cannot do get org by specific name as there might be duplicates
    GSI1SK: GSI1SK, // Actual org name ie: Plutomi Inc - Can be changed!
  };

  try {
    const transactParams: TransactWriteCommandInput = {
      TransactItems: [
        {
          // Update user with the new org
          Update: {
            Key: {
              PK: `USER#${userId}`,
              SK: `USER`,
            },
            TableName: DYNAMO_TABLE_NAME,
            UpdateExpression:
              "SET orgId = :orgId, orgJoinDate = :orgJoinDate, GSI1PK = :GSI1PK",
            ExpressionAttributeValues: {
              ":orgId": orgId,
              ":orgJoinDate": now,
              ":GSI1PK": `ORG#${orgId}#USERS`,
            },
          },
        },
        {
          // Create the org
          Put: {
            Item: newOrg,
            TableName: DYNAMO_TABLE_NAME,
            ConditionExpression: "attribute_not_exists(PK)",
          },
        },
      ],
    };

    const response = await Dynamo.send(
      new TransactWriteCommand(transactParams)
    );

    return;
  } catch (error) {
    console.error(error);
    throw new Error(error);
  }
}
