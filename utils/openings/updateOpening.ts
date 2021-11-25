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
  // TODO user the cleaning functions instead

  const incomingKeys = Object.keys(newOpeningValues);
  // TODO should this throw an error and
  // let the user know we can't update that key?
  // Maybe just return in the message that we weren't able to update those keys
  const newKeys = incomingKeys.filter(
    (key) => !FORBIDDEN_PROPERTIES.OPENING.includes(key)
  );

  // Build update expression
  let newUpdateExpression: string[] = [];
  let newAttributes: any = {};

  newKeys.forEach((key) => {
    newUpdateExpression.push(`${key} = :${key}`);
    newAttributes[`:${key}`] = newOpeningValues[key];
  });

  const UpdatedExpression = `SET ${newUpdateExpression.join(", ").toString()}`;

  const params: UpdateCommandInput = {
    Key: {
      PK: `${ENTITY_TYPES.ORG}#${orgId}#${ENTITY_TYPES.OPENING}#${openingId}`,
      SK: `${ENTITY_TYPES.OPENING}`,
    },
    UpdateExpression: UpdatedExpression,
    ExpressionAttributeValues: newAttributes,
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
