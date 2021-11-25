import { UpdateCommand, UpdateCommandInput } from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../awsClients/ddbDocClient";
import { ENTITY_TYPES, DEFAULTS } from "../../Config";
import { DynamoNewUser } from "../../types/dynamo";
import { UpdateUserInput } from "../../types/main";
import { FORBIDDEN_PROPERTIES } from "../../Config";
const { DYNAMO_TABLE_NAME } = process.env;

export async function updateUser(
  props: UpdateUserInput
): Promise<DynamoNewUser> {
  const { userId, newUserValues, ALLOW_FORBIDDEN_KEYS } = props;
  try {
    const incomingKeys = Object.keys(newUserValues);
    let newKeys = ALLOW_FORBIDDEN_KEYS
      ? incomingKeys
      : incomingKeys.filter((key) => !FORBIDDEN_PROPERTIES.USER.includes(key));

    let newUpdateExpression: string[] = [];
    let newAttributes: any = {};

    newKeys.forEach((key) => {
      newUpdateExpression.push(`${key} = :${key}`);
      newAttributes[`:${key}`] = newUserValues[key];
    });

    // TODO refactor this into its own function, easy way to have banned values
    const bannedKeys = [
      DEFAULTS.FIRST_NAME,
      DEFAULTS.LAST_NAME,
      DEFAULTS.FULL_NAME,
    ];

    // @ts-ignore TODO fix types
    const checker = (value) =>
      bannedKeys.some((element) => value.includes(element));

    const matching = Object.values(newAttributes).filter(checker);
    if (matching.length > 0) {
      throw `Invalid values: ${matching}`;
    }

    const NewUpdateExpression = `SET ${newUpdateExpression.join(", ")}`;
    const params: UpdateCommandInput = {
      Key: {
        PK: `${ENTITY_TYPES.USER}#${userId}`,
        SK: ENTITY_TYPES.USER,
      },
      UpdateExpression: NewUpdateExpression,
      ExpressionAttributeValues: newAttributes,
      TableName: DYNAMO_TABLE_NAME,
      ReturnValues: "ALL_NEW",
      ConditionExpression: "attribute_exists(PK)",
    };

    const updatedUser = await Dynamo.send(new UpdateCommand(params));
    return updatedUser.Attributes as DynamoNewUser;
  } catch (error) {
    throw new Error(error);
  }
}
