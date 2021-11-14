import { UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../awsClients/ddbDocClient";
import { UpdateQuestionInput } from "../../types/Questions";
const { DYNAMO_TABLE_NAME } = process.env;

export default async function updateQuestion(
  props: UpdateQuestionInput
): Promise<void> {
  const { orgId, questionId, newQuestionValues } = props;
  // TODO user the cleaning functions instead

  const FORBIDDEN_KEYS = [
    "PK",
    "SK",
    "orgId",
    "entityType",
    "createdAt",
    "openingId",
    "GSI1PK",
  ];

  const incomingKeys = Object.keys(newQuestionValues);
  // TODO should this throw an error and
  // let the user know we can't update that key?
  // Maybe just return in the message that we weren't able to update those keys
  const newKeys = incomingKeys.filter((key) => !FORBIDDEN_KEYS.includes(key));

  // Build update expression
  let newUpdateExpression: string[] = [];
  let newAttributes: any = {};

  newKeys.forEach((key) => {
    newUpdateExpression.push(`${key} = :${key}`);
    newAttributes[`:${key}`] = newQuestionValues[key];
  });

  const UpdatedExpression = `SET ${newUpdateExpression.join(", ").toString()}`;

  const params = {
    Key: {
      PK: `ORG#${orgId}#QUESTION#${questionId}`,
      SK: `QUESTION`,
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
