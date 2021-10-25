import { UpdateCommand, UpdateCommandInput } from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../libs/ddbDocClient";

const { DYNAMO_TABLE_NAME } = process.env;

export async function UpdateUser({
  new_user_values,
  user_id,
  ALLOW_FORBIDDEN_KEYS,
}: {
  new_user_values: any;
  user_id: string;
  ALLOW_FORBIDDEN_KEYS?: boolean;
}) {
  try {
    // TODO user the cleaning functions instead
    const FORBIDDEN_KEYS = [
      "PK",
      "SK",
      "org_id",
      "entity_type",
      "created_at",
      "opening_id",
      "GSI1PK",
      "GSI2PK",
      "user_role",
      "org_join_date",
    ];

    const incomingKeys = Object.keys(new_user_values);
    let newKeys = ALLOW_FORBIDDEN_KEYS
      ? incomingKeys
      : incomingKeys.filter((key) => !FORBIDDEN_KEYS.includes(key));

    let newUpdateExpression: string[] = [];
    let newAttributes: any = {};

    newKeys.forEach((key) => {
      newUpdateExpression.push(`${key} = :${key}`);
      newAttributes[`:${key}`] = new_user_values[key];
    });

    if (
      // TODO reformat this to a function that checks for invalid names
      newAttributes[":first_name"] === "NO_FIRST_NAME" ||
      newAttributes[":last_name"] === "NO_LAST_NAME" ||
      newAttributes[":GSI1SK"].includes("NO_FIRST_NAME") ||
      newAttributes[":GSI1SK"].includes("NO_LAST_NAME")
    ) {
      throw `Invalid name, cannot include 'NO_FIRST_NAME' or 'NO_LAST_NAME'`;
    }
    const NewUpdateExpression = `SET ${newUpdateExpression.join(", ")}`;

    const params: UpdateCommandInput = {
      Key: {
        PK: `USER#${user_id}`,
        SK: `USER`,
      },
      UpdateExpression: NewUpdateExpression,
      ExpressionAttributeValues: newAttributes,
      TableName: DYNAMO_TABLE_NAME,
      ReturnValues: "ALL_NEW",
      ConditionExpression: "attribute_exists(PK)",
    };

    const updated_user = await Dynamo.send(new UpdateCommand(params));
    return updated_user as DynamoUser;
  } catch (error) {
    throw new Error(error);
  }
}
