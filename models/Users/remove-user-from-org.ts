import {
  TransactWriteCommandInput,
  TransactWriteCommand,
} from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../AWSClients/ddbDocClient";
import { DEFAULTS, DYNAMO_TABLE_NAME, ENTITY_TYPES } from "../../Config";
import { SdkError } from "@aws-sdk/types";

interface RemoveUserFromOrgInput {
  /**
   * The ID of the org the user is in
   */
  orgId: string;
  /**
   * The ID of the user you want to remove
   */
  userId: string;
  /**
   * The ID of the person who created the org
   */
  createdById: string;
}
export default async function RemoveUserFromOrg(
  props: RemoveUserFromOrgInput
): Promise<[null, null] | [null, SdkError]> {
  const { userId, createdById, orgId } = props;
  // TODO types
  try {
    const transactParams: TransactWriteCommandInput = {
      TransactItems: [
        {
          // Remove the user from the org
          Update: {
            Key: {
              PK: `${ENTITY_TYPES.USER}#${userId}`,
              SK: ENTITY_TYPES.USER,
            },
            TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,
            UpdateExpression:
              "SET orgId = :orgId, orgJoinDate = :orgJoinDate, GSI1PK = :GSI1PK",
            ExpressionAttributeValues: {
              ":orgId": DEFAULTS.NO_ORG,
              ":orgJoinDate": DEFAULTS.NO_ORG,
              ":GSI1PK": `${ENTITY_TYPES.ORG}#${DEFAULTS.NO_ORG}#${ENTITY_TYPES.USER}S`,
            },
          },
        },
        {
          // Decrement the orginal org's total users
          Update: {
            Key: {
              PK: `${ENTITY_TYPES.ORG}#${orgId}`,
              SK: ENTITY_TYPES.ORG,
            },
            TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,
            UpdateExpression: "SET totalUsers = totalUsers - :value",
            ExpressionAttributeValues: {
              ":value": 1,
              ":createdBy": createdById,
            },
            // Only allow the org creator to remove users // TODO RBAC
            ConditionExpression:
              "attribute_exists(PK) AND createdBy = :createdBy",
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
