import { Dynamo } from "../../libs/ddbDocClient";
const { DYNAMO_TABLE_NAME } = process.env;
import { UpdateCommand, UpdateCommandInput } from "@aws-sdk/lib-dynamodb";

const forbidden_keys = ["TODO","email", "user_id", "org_id"];

export async function UpdateUser({ body, user_id }: UpdateUserInput) {
  try {
    const incomingKeys = Object.keys(body);
    const newKeys = incomingKeys.filter((key) => !forbidden_keys.includes(key));

    let newUpdateExpression: string[] = [];
    let newAttributes: any = {};

    newKeys.forEach((key) => {
      newUpdateExpression.push(`${key} = :${key}`);
      newAttributes[`:${key}`] = body[key];
    });

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

    const response = await Dynamo.send(new UpdateCommand(params));
    return response.Attributes;
  } catch (error) {
    throw new Error(`Unable to update user: ${error}`);
  }
}
