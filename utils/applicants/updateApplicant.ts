import { UpdateCommand, UpdateCommandInput } from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../awsClients/ddbDocClient";
import { ENTITY_TYPES } from "../../Config";
import { UpdateApplicantInput } from "../../types/main";
const { DYNAMO_TABLE_NAME } = process.env;
const FORBIDDEN_KEYS = [
  "PK",
  "SK",
  "orgId",
  "entityType",
  "createdAt",
  "applicantId",
  "GSI1PK",
  "ttlExpiry"
];
/**
 * Updates an applicant with the specified `newApplicantValues`
 * @param props {@link UpdateApplicantInput}
 */
export default async function updateApplicant(
  props: UpdateApplicantInput
): Promise<void> {
  const { orgId, applicantId, newApplicantValues } = props;

  // TODO user the cleaning functions instead
  const incomingKeys = Object.keys(newApplicantValues);
  // TODO should this throw an error and
  // let the user know we can't update that key?
  // Maybe just return in the message that we weren't able to update those keys
  const newKeys = incomingKeys.filter((key) => !FORBIDDEN_KEYS.includes(key));

  // Build update expression
  let newUpdateExpression: string[] = [];
  let newAttributes: any = {};

  newKeys.forEach((key) => {
    newUpdateExpression.push(`${key} = :${key}`);
    newAttributes[`:${key}`] = newApplicantValues[key];
  });

  const UpdatedExpression = `SET ${newUpdateExpression.join(", ").toString()}`;

  const params: UpdateCommandInput = {
    Key: {
      PK: `${ENTITY_TYPES.ORG}#${orgId}#${ENTITY_TYPES.APPLICANT}#${applicantId}`,
      SK: `${ENTITY_TYPES.APPLICANT}`,
    },
    UpdateExpression: UpdatedExpression,
    ExpressionAttributeValues: newAttributes,
    TableName: DYNAMO_TABLE_NAME,
    ConditionExpression: "attribute_exists(PK)",
  };

  try {
    await Dynamo.send(new UpdateCommand(params));
  } catch (error) {
    throw new Error(error);
  }
}
