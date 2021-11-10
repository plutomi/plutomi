import { UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../awsClients/ddbDocClient";
const { DYNAMO_TABLE_NAME } = process.env;

export default async function UpdateQuestion({
  orgId,
  question_id,
  new_question_values,
}) {
  // TODO user the cleaning functions instead

  const FORBIDDEN_KEYS = [
    "PK",
    "SK",
    "orgId",
    "entityType",
    "created_at",
    "openingId",
    "GSI1PK",
  ];

  const incomingKeys = Object.keys(new_question_values);
  // TODO should this throw an error and
  // let the user know we can't update that key?
  // Maybe just return in the message that we weren't able to update those keys
  const newKeys = incomingKeys.filter((key) => !FORBIDDEN_KEYS.includes(key));

  // Build update expression
  let newUpdateExpression: string[] = [];
  let newAttributes: any = {};

  newKeys.forEach((key) => {
    newUpdateExpression.push(`${key} = :${key}`);
    newAttributes[`:${key}`] = new_question_values[key];
  });

  const UpdatedExpression = `SET ${newUpdateExpression.join(", ").toString()}`;

  const params = {
    Key: {
      PK: `ORG#${orgId}#QUESTION#${question_id}`,
      SK: `STAGE_QUESTION`,
    },
    UpdateExpression: UpdatedExpression,
    ExpressionAttributeValues: newAttributes,
    TableName: DYNAMO_TABLE_NAME,
    ConditionExpression: "attribute_exists(PK)", // This is throwing an error
  };

  try {
    await Dynamo.send(new UpdateCommand(params));
    return;
  } catch (error) {
    throw new Error(error);
  }
}
