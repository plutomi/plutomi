import {
  TransactWriteCommand,
  TransactWriteCommandInput,
} from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../libs/ddbDocClient";
import { GetCurrentTime } from "../time";

const { DYNAMO_TABLE_NAME } = process.env;

export async function JoinOrg({ user_id, invite }) {
  const now = GetCurrentTime("iso") as string;
  try {
    const transactParams: TransactWriteCommandInput = {
      TransactItems: [
        {
          // Delete org invite
          Delete: {
            Key: {
              PK: `USER#${user_id}`,
              SK: `ORG_INVITE#${invite.invite_id}`,
            },
            TableName: DYNAMO_TABLE_NAME,
            ConditionExpression: "attribute_not_exists(PK)",
          },
        },

        {
          // Update user with the new org
          Update: {
            Key: {
              PK: `USERS#${user_id}`,
              SK: `USER`,
            },
            TableName: DYNAMO_TABLE_NAME,
            UpdateExpression:
              "SET org_id = :org_id, org_join_date = :org_join_date, GSI1PK = :GSI1PK",
            ExpressionAttributeValues: {
              ":org_id": invite.org_id,
              ":org_join_date": now,
              ":GSI1PK": `ORG#${invite.org_id}#USERS`,
            },
          },
        },
        {
          // Increment the org with the new user // TODO might have to do this asynchronously
          Update: {
            Key: {
              PK: `ORGS#${invite.org_id}`,
              SK: `ORG`,
            },
            TableName: DYNAMO_TABLE_NAME,
            UpdateExpression: "SET total_users = total_users + :value",
            ExpressionAttributeValues: {
              ":value": 1,
            },
          },
        },
      ],
    };

    await Dynamo.send(new TransactWriteCommand(transactParams));
  } catch (error) {
    console.error(error);
    throw new Error(error);
  }
}
