import { UpdateCommandInput, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../AWSClients/ddbDocClient";
import { FORBIDDEN_PROPERTIES, ENTITY_TYPES, ID_LENGTHS } from "../../Config";
import { UpdateApplicantInput } from "../../types/main";
const { DYNAMO_TABLE_NAME } = process.env;
import { SdkError } from "@aws-sdk/types";
export default async function Update(
  props: UpdateApplicantInput
): Promise<[null, null] | [null, SdkError]> {
  const { applicantId, newValues } = props;

  // Build update expression
  let allUpdateExpressions: string[] = [];
  let allAttributeValues: { [key: string]: string } = {};

  // Filter out forbidden property
  for (const property in newValues) {
    if (FORBIDDEN_PROPERTIES.APPLICANT.includes(property)) {
      // Delete the property so it isn't updated
      delete newValues[property];
    }

    // If its a valid property, start creating the new update expression
    // Push each property into the update expression
    allUpdateExpressions.push(`${property} = :${property}`);

    // Create values for each attribute
    allAttributeValues[`:${property}`] = newValues[property];
  }

  const params: UpdateCommandInput = {
    Key: {
      PK: `${ENTITY_TYPES.APPLICANT}#${applicantId}`,
      SK: ENTITY_TYPES.APPLICANT,
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
