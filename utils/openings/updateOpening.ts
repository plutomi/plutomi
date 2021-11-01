import { UpdateCommand, UpdateCommandInput } from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../lib/awsClients/ddbDocClient";
const { DYNAMO_TABLE_NAME } = process.env;

export default async function UpdateOpening({
  org_id,
  opening_id,
  new_opening_values,
}) {
  // TODO user the cleaning functions instead
  const FORBIDDEN_KEYS = [
    "PK",
    "SK",
    "org_id",
    "entity_type",
    "created_at",
    "opening_id",
    "GSI1PK",
  ];

  const incomingKeys = Object.keys(new_opening_values);
  // TODO should this throw an error and
  // let the user know we can't update that key?
  // Maybe just return in the message that we weren't able to update those keys
  const newKeys = incomingKeys.filter((key) => !FORBIDDEN_KEYS.includes(key));

  // Build update expression
  let newUpdateExpression: string[] = [];
  let newAttributes: any = {};

  newKeys.forEach((key) => {
    newUpdateExpression.push(`${key} = :${key}`);
    newAttributes[`:${key}`] = new_opening_values[key];
  });

  const UpdatedExpression = `SET ${newUpdateExpression.join(", ").toString()}`;

  const params: UpdateCommandInput = {
    Key: {
      PK: `ORG#${org_id}#OPENING#${opening_id}`,
      SK: `OPENING`,
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
