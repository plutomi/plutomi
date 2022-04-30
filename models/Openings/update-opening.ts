import { UpdateCommandInput, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../AWSClients/ddbDocClient";
import { DYNAMO_TABLE_NAME, ENTITY_TYPES } from "../../Config";
import { UpdateOpeningInput } from "../../types/main";
import { SdkError } from "@aws-sdk/types";

export default async function UpdateOpening(
  props: UpdateOpeningInput
): Promise<[null, null] | [null, SdkError]> {
  const { orgId, openingId, newValues } = props;
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
      PK: `${ENTITY_TYPES.ORG}#${orgId}#${ENTITY_TYPES.OPENING}#${openingId}`,
      SK: ENTITY_TYPES.OPENING,
    },
    UpdateExpression: `SET ` + allUpdateExpressions.join(", "),
    ExpressionAttributeValues: allAttributeValues,
    TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,

    ConditionExpression: "attribute_exists(PK)",
  };

  try {
    await Dynamo.send(new UpdateCommand(params));
    return [null, null];
  } catch (error) {
    return [null, error];
  }
}
