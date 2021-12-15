import { UpdateCommandInput, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../awsClients/ddbDocClient";
import { FORBIDDEN_PROPERTIES, ENTITY_TYPES, ID_LENGTHS } from "../../Config";
import { UpdateApplicantInput } from "../../types/main";
const { DYNAMO_TABLE_NAME } = process.env;
import { SdkError } from "@aws-sdk/types";
export default async function Update(
  props: UpdateApplicantInput
): Promise<[null, null] | [null, SdkError]> {
  const { applicantId, newApplicantValues } = props;

  // Build update expression
  let allUpdateExpressions: string[] = [];
  let allAttributeValues: any = {};

  // Filter out forbidden property
  for (const property in newApplicantValues) {
    if (FORBIDDEN_PROPERTIES.APPLICANT.includes(property)) {
      // Delete the property so it isn't updated
      delete newApplicantValues[property];
    }

    // If its a valid property, start creating the new update expression
    // Push each property into the update expression
    allUpdateExpressions.push(`${property} = :${property}`);

    // Create values for each attribute
    allAttributeValues[`:${property}`] = newApplicantValues[property];
  }

  const params: UpdateCommandInput = {
    Key: {
      PK: `${ENTITY_TYPES.APPLICANT}#${applicantId}`,
      SK: ENTITY_TYPES.APPLICANT,
    },
    UpdateExpression: `SET ` + allUpdateExpressions.join(", "),
    ExpressionAttributeValues: allAttributeValues,
    TableName: DYNAMO_TABLE_NAME,
    ConditionExpression: "attribute_exists(PK)",
  };

  try {
    await Dynamo.send(new UpdateCommand(params));
    return [null, null];
  } catch (error) {
    return [null, error];
  }
}
