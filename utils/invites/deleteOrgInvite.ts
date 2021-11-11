import {
  TransactWriteCommand,
  TransactWriteCommandInput,
} from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../awsClients/ddbDocClient";

const { DYNAMO_TABLE_NAME } = process.env;
export default async function DeleteOrgInvite({ userId, invite_id }) {
  try {
    const transactParams: TransactWriteCommandInput = {
      TransactItems: [
        {
          // Delete the org invite
          Delete: {
            Key: {
              PK: `USER#${userId}`,
              SK: `ORG_INVITE#${invite_id}`,
            },
            TableName: DYNAMO_TABLE_NAME,
          },
        },

        {
          // Decrement the user's total invites
          Update: {
            Key: {
              PK: `USER#${userId}`,
              SK: `USER`,
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
