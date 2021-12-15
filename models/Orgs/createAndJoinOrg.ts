import {
  TransactWriteCommandInput,
  TransactWriteCommand,
} from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../awsClients/ddbDocClient";
import { ENTITY_TYPES } from "../../Config";
import { DynamoNewOrg } from "../../types/dynamo";
import { CreateAndJoinOrgInput } from "../../types/main";
import * as Time from "../../utils/time";
import { SdkError } from "@aws-sdk/types";
const { DYNAMO_TABLE_NAME } = process.env;
export default async function CreateAndJoinOrg(
  props: CreateAndJoinOrgInput
): Promise<[null, null] | [null, SdkError]> {
  const { userId, orgId, GSI1SK } = props;
  const now = Time.currentISO();

  const newOrg: DynamoNewOrg = {
    PK: `${ENTITY_TYPES.ORG}#${orgId}`,
    SK: ENTITY_TYPES.ORG,
    orgId: orgId, // plutomi - Cannot be changed
    entityType: ENTITY_TYPES.ORG,
    createdAt: now,
    totalApplicants: 0,
    totalOpenings: 0,
    totalStages: 0,
    totalUsers: 1,
    GSI1PK: ENTITY_TYPES.ORG, // Allows for 'get all orgs' query
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
              PK: `${ENTITY_TYPES.USER}#${userId}`,
              SK: ENTITY_TYPES.USER,
            },
            TableName: DYNAMO_TABLE_NAME,
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
            TableName: DYNAMO_TABLE_NAME,
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
