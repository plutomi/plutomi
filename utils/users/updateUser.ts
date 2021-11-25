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

  // Build update expression
  let allUpdateExpressions: string[] = [];
  let allAttributeValues: any = {};

  try {
    for (const property in newUserValues) {
      // If updating forbidden keys is banned, filter these keys out
      if (
        !ALLOW_FORBIDDEN_KEYS &&
        FORBIDDEN_PROPERTIES.STAGE.includes(property)
      ) {
        delete newUserValues[property];
      }
      // If its a valid property, start creating the new update expression
      // Push each property into the update expression
      allUpdateExpressions.push(`${property} = :${property}`);

      // Create values for each attribute
      allAttributeValues[`:${property}`] = newUserValues[property];
    }

    const params: UpdateCommandInput = {
      Key: {
        PK: `${ENTITY_TYPES.USER}#${userId}`,
        SK: ENTITY_TYPES.USER,
      },
      ReturnValues: "ALL_NEW",
      UpdateExpression: `SET ` + allUpdateExpressions.join(", "),
      ExpressionAttributeValues: allAttributeValues,
      TableName: DYNAMO_TABLE_NAME,
      ConditionExpression: "attribute_exists(PK)",
    };

    const updatedUser = await Dynamo.send(new UpdateCommand(params));
    return updatedUser.Attributes as DynamoNewUser;
  } catch (error) {
    throw new Error(error);
  }
}
