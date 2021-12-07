import { UpdateCommand, UpdateCommandInput } from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../awsClients/ddbDocClient";
import { ENTITY_TYPES } from "../../Config";
import { UpdateOpeningInput } from "../../types/main";
const { DYNAMO_TABLE_NAME } = process.env;
import { FORBIDDEN_PROPERTIES } from "../../Config";
export default async function updateOpening(
  props: UpdateOpeningInput
): Promise<void> {
  const { orgId, openingId, newOpeningValues } = props;
  // Build update expression
  let allUpdateExpressions: string[] = [];
  let allAttributeValues: any = {};

  // Filter out forbidden property
  for (const property in newOpeningValues) {
    if (FORBIDDEN_PROPERTIES.STAGE.includes(property)) {
      // Delete the property so it isn't updated
      delete newOpeningValues[property];
    }

    // If its a valid property, start creating the new update expression
    // Push each property into the update expression
    allUpdateExpressions.push(`${property} = :${property}`);

    // Create values for each attribute
    allAttributeValues[`:${property}`] = newOpeningValues[property];
  }

  const params: UpdateCommandInput = {
    Key: {
      PK: `${ENTITY_TYPES.ORG}#${orgId}#${ENTITY_TYPES.OPENING}#${openingId}`,
      SK: ENTITY_TYPES.OPENING,
    },
    UpdateExpression: `SET ` + allUpdateExpressions.join(", "),
    ExpressionAttributeValues: allAttributeValues,
    TableName: DYNAMO_TABLE_NAME,
    ConditionExpression: "attribute_exists(PK)",
  };

  try {
    await Dynamo.send(new UpdateCommand(params));
    return;
  } catch (error) {
    throw new Error(error);
  }
}
