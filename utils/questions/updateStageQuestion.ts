import { UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../awsClients/ddbDocClient";
import { ENTITY_TYPES } from "../../Config";
import { UpdateQuestionInput } from "../../types/main";
const { DYNAMO_TABLE_NAME } = process.env;
import { FORBIDDEN_PROPERTIES } from "../../Config";

export default async function updateQuestion(
  props: UpdateQuestionInput
): Promise<void> {
  const { orgId, questionId, newQuestionValues } = props;
  // TODO user the cleaning functions instead

  const incomingProperties = Object.keys(newQuestionValues);
  // TODO should this throw an error and
  // let the user know we can't update that key?
  // Maybe just return in the message that we weren't able to update those keys
  const newKeys = incomingProperties.filter(
    (key) => !FORBIDDEN_PROPERTIES.STAGE_QUESTION.includes(key)
  );

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
      PK: `${ENTITY_TYPES.ORG}#${orgId}#${ENTITY_TYPES.STAGE_QUESTION}#${questionId}`,
      SK: `${ENTITY_TYPES.STAGE_QUESTION}`,
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
