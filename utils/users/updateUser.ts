import { UpdateCommand, UpdateCommandInput } from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../awsClients/ddbDocClient";

const { DYNAMO_TABLE_NAME } = process.env;

export async function UpdateUser({
  new_user_values,
  userId,
  ALLOW_FORBIDDEN_KEYS,
}: {
  new_user_values: any;
  userId: string;
  ALLOW_FORBIDDEN_KEYS?: boolean;
}) {
  try {
    // TODO user the cleaning functions instead
    const FORBIDDEN_KEYS = [
      "PK",
      "SK",
      "orgId",
      "entityType",
      "created_at",
      "openingId",
      "GSI1PK",
      "GSI2PK",
      "user_role",
      "orgJoinDate",
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

    // TODO refactor this into its own function, easy way to have banned values
    const banned_values = ["NO_FIRST_NAME", "NO_LAST_NAME"];

    // @ts-ignore TODO fix types
    const checker = (value) =>
      banned_values.some((element) => value.includes(element));

    const matching = Object.values(newAttributes).filter(checker);
    if (matching.length > 0) {
      throw `Invalid values: ${matching}`;
    }

    const NewUpdateExpression = `SET ${newUpdateExpression.join(", ")}`;
    const params: UpdateCommandInput = {
      Key: {
        PK: `USER#${userId}`,
        SK: `USER`,
      },
      UpdateExpression: NewUpdateExpression,
      ExpressionAttributeValues: newAttributes,
      TableName: DYNAMO_TABLE_NAME,
      ReturnValues: "ALL_NEW",
      ConditionExpression: "attribute_exists(PK)",
    };

    const updated_user = await Dynamo.send(new UpdateCommand(params));
    return updated_user.Attributes as DynamoUser;
  } catch (error) {
    throw new Error(error);
  }
}
