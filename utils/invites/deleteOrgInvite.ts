import {
  TransactWriteCommand,
  TransactWriteCommandInput,
} from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../awsClients/ddbDocClient";
import { ENTITY_TYPES } from "../../defaults";

const { DYNAMO_TABLE_NAME } = process.env;
export default async function deleteOrgInvite({ userId, inviteId }) {
  try {
    const transactParams: TransactWriteCommandInput = {
      TransactItems: [
        {
          // Delete the org invite
          Delete: {
            Key: {
              PK: `${ENTITY_TYPES.USER}#${userId}`,
              SK: `${ENTITY_TYPES.ORG_INVITE}#${inviteId}`,
            },
            TableName: DYNAMO_TABLE_NAME,
          },
        },

        {
          // Decrement the user's total invites
          Update: {
            Key: {
              PK: `${ENTITY_TYPES.USER}#${userId}`,
              SK: ENTITY_TYPES.USER,
            },
            TableName: DYNAMO_TABLE_NAME,
            UpdateExpression: "SET totalInvites = totalInvites - :value",
            ExpressionAttributeValues: {
              ":value": 1,
            },
          },
        },
      ],
    };

    await Dynamo.send(new TransactWriteCommand(transactParams));
    return;
  } catch (error) {
    throw new Error(`Unable to delete invite ${error}`);
  }
}
