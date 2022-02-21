import {
  TransactWriteCommandInput,
  TransactWriteCommand,
} from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../awsClients/ddbDocClient";
import { DYNAMO_TABLE_NAME, ENTITY_TYPES } from "../../Config";
import { DynamoOrg } from "../../types/dynamo";
import { CreateAndJoinOrgInput } from "../../types/main";
import * as Time from "../../utils/time";
import { SdkError } from "@aws-sdk/types";
export default async function CreateAndJoinOrg(
  props: CreateAndJoinOrgInput
): Promise<[null, null] | [null, SdkError]> {
  const { userId, orgId, displayName } = props;
  const now = Time.currentISO();

  const newOrg: DynamoOrg = {
    PK: `${ENTITY_TYPES.ORG}#${orgId}`,
    SK: ENTITY_TYPES.ORG,
    orgId, // Cannot be changed
    entityType: ENTITY_TYPES.ORG,
    createdAt: now,
    createdBy: userId,
    totalApplicants: 0,
    totalOpenings: 0,
    totalUsers: 1,
    totalWebhooks: 0,
    totalQuestions: 0,
    displayName,
  };

  try {
    const transactParams: TransactWriteCommandInput = {
      TransactItems: [
        {
          // Update user with the new org
          Update: {
            Key: {
              PK: `${ENTITY_TYPES.USER}#${userId}`,
              SK: ENTITY_TYPES.USER,
            },
            TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,
            UpdateExpression:
              "SET orgId = :orgId, orgJoinDate = :orgJoinDate, GSI1PK = :GSI1PK",
            ExpressionAttributeValues: {
              ":orgId": orgId,
              ":orgJoinDate": now,
              ":GSI1PK": `${ENTITY_TYPES.ORG}#${orgId}#${ENTITY_TYPES.USER}S`,
            },
          },
        },
        {
          // Create the org
          Put: {
            Item: newOrg,
            TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,
            ConditionExpression: "attribute_not_exists(PK)",
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
