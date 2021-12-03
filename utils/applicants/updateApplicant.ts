import { UpdateCommand, UpdateCommandInput } from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../awsClients/ddbDocClient";
import { ENTITY_TYPES } from "../../Config";
import { UpdateApplicantInput } from "../../types/main";
const { DYNAMO_TABLE_NAME } = process.env;
import { FORBIDDEN_PROPERTIES } from "../../Config";
/**
 * Updates an applicant with the specified `newApplicantValues`
 * @param props {@link UpdateApplicantInput}
 */

// TODO - MAJOR~!
// When it comes to advancing an applicant, we're going to want a new stage id and new opening id
// And we obviously don't want to update the entire GSI..
export default async function updateApplicant(
  props: UpdateApplicantInput
): Promise<void> {
  const { orgId, applicantId, newApplicantValues } = props;

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
      PK: `${ENTITY_TYPES.ORG}#${orgId}#${ENTITY_TYPES.APPLICANT}#${applicantId}`,
      SK: ENTITY_TYPES.APPLICANT,
    },
    UpdateExpression: `SET ` + allUpdateExpressions.join(", "),
    ExpressionAttributeValues: allAttributeValues,
    TableName: DYNAMO_TABLE_NAME,
    ConditionExpression: "attribute_exists(PK)",
  };

  try {
    await Dynamo.send(new UpdateCommand(params));
  } catch (error) {
    throw new Error(error);
  }
}
