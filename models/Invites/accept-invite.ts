import {
  TransactWriteCommandInput,
  TransactWriteCommand,
} from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../awsClients/ddbDocClient";
import { DYNAMO_TABLE_NAME, ENTITY_TYPES } from "../../Config";
import { JoinOrgFromInviteInput } from "../../types/main";
import * as Time from "../../utils/time";
import { SdkError } from "@aws-sdk/types";

export default async function Join(
  props: JoinOrgFromInviteInput
): Promise<[null, null] | [null, SdkError]> {
  const { userId, invite } = props;
  // TODO types
  try {
    const transactParams: TransactWriteCommandInput = {
      TransactItems: [
        {
          // Delete org invite
          Delete: {
            Key: {
              PK: `${ENTITY_TYPES.USER}#${userId}`,
              SK: `${ENTITY_TYPES.ORG_INVITE}#${invite.inviteId}`,
            },
            TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,

            ConditionExpression: "attribute_exists(PK)",
          },
        },

        {
          // Update the user with the new org
          Update: {
            Key: {
              PK: `${ENTITY_TYPES.USER}#${userId}`,
              SK: ENTITY_TYPES.USER,
            },
            TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,

            UpdateExpression:
              "SET orgId = :orgId, orgJoinDate = :orgJoinDate, GSI1PK = :GSI1PK, totalInvites = totalInvites - :value",
            ExpressionAttributeValues: {
              ":orgId": invite.orgId,
              ":orgJoinDate": Time.currentISO(),
              ":GSI1PK": `${ENTITY_TYPES.ORG}#${invite.orgId}#${ENTITY_TYPES.USER}S`,
              ":value": 1,
            },
            ConditionExpression: "attribute_exists(PK)",
          },
        },
        {
          // Increment the org with the new user
          Update: {
            Key: {
              PK: `${ENTITY_TYPES.ORG}#${invite.orgId}`,
              SK: ENTITY_TYPES.ORG,
            },
            TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,

            UpdateExpression: "SET totalUsers = totalUsers + :value",
            ExpressionAttributeValues: {
              ":value": 1,
            },
            ConditionExpression: "attribute_exists(PK)",
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
