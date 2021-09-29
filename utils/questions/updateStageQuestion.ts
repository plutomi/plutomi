import { UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../libs/ddbDocClient";
const { DYNAMO_TABLE_NAME } = process.env;

export default async function UpdateQuestion({
  org_id,
  opening_id,
  stage_id,
  updated_question,
}) {
  const FORBIDDEN_KEYS = [
    "PK",
    "SK",
    "org_id",
    "entity_type",
    "created_at",
    "opening_id",
    "GSI1PK",
  ];

  const incomingKeys = Object.keys(updated_question);
  // TODO should this throw an error and
  // let the user know we can't update that key?
  // Maybe just return in the message that we weren't able to update those keys
  const newKeys = incomingKeys.filter((key) => !FORBIDDEN_KEYS.includes(key));

  // Build update expression
  let newUpdateExpression: string[] = [];
  let newAttributes: any = {};

  newKeys.forEach((key) => {
    newUpdateExpression.push(`${key} = :${key}`);
    newAttributes[`:${key}`] = updated_question[key];
  });

  const UpdatedExpression = `SET ${newUpdateExpression.join(", ").toString()}`;

  const params = {
    Key: {
      PK: `ORG#${org_id}#OPENING#${opening_id}#STAGE#${stage_id}`,
      SK: `STAGE_QUESTION#${updated_question.question_id}`,
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
