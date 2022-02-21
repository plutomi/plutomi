import { UpdateCommandInput, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../awsClients/ddbDocClient";
import { DYNAMO_TABLE_NAME, ENTITY_TYPES } from "../../Config";
import { DynamoUser } from "../../types/dynamo";
import { UpdateUserInput } from "../../types/main";
import { SdkError } from "@aws-sdk/types";
export default async function Update(
  props: UpdateUserInput
): Promise<[DynamoUser, null] | [null, SdkError]> {
  const { userId, newValues } = props;

  // Build update expression
  let allUpdateExpressions: string[] = [];
  let allAttributeValues: { [key: string]: string } = {};

  for (const property in newValues) {
    // Push each property into the update expression
    allUpdateExpressions.push(`${property} = :${property}`);

    // Create values for each attribute
    allAttributeValues[`:${property}`] = newValues[property];
  }

  const params: UpdateCommandInput = {
    Key: {
      PK: `${ENTITY_TYPES.USER}#${userId}`,
      SK: ENTITY_TYPES.USER,
    },
    ReturnValues: "ALL_NEW",
    UpdateExpression: `SET ` + allUpdateExpressions.join(", "),
    ExpressionAttributeValues: allAttributeValues,
    TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,
    ConditionExpression: "attribute_exists(PK)",
  };
  try {
    const updatedUser = await Dynamo.send(new UpdateCommand(params));
    return [updatedUser.Attributes as DynamoUser, null];
  } catch (error) {
    return [null, error];
  }
}
