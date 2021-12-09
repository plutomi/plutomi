import { UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../awsClients/ddbDocClient";
import { FORBIDDEN_PROPERTIES, ENTITY_TYPES } from "../../Config";
import { UpdateQuestionInput } from "../../types/main";
const { DYNAMO_TABLE_NAME } = process.env;
export default async function Update(
  props: UpdateQuestionInput
): Promise<void> {
  const { orgId, questionId, newQuestionValues } = props;
  // Build update expression
  let allUpdateExpressions: string[] = [];
  let allAttributeValues: any = {};

  // Filter out forbidden property
  for (const property in newQuestionValues) {
    if (FORBIDDEN_PROPERTIES.STAGE_QUESTION.includes(property)) {
      // Delete the property so it isn't updated
      delete newQuestionValues[property];
    }

    // If its a valid property, start creating the new update expression
    // Push each property into the update expression
    allUpdateExpressions.push(`${property} = :${property}`);

    // Create values for each attribute
    allAttributeValues[`:${property}`] = newQuestionValues[property];
  }

  const params = {
    Key: {
      PK: `${ENTITY_TYPES.ORG}#${orgId}#${ENTITY_TYPES.STAGE_QUESTION}#${questionId}`,
      SK: ENTITY_TYPES.STAGE_QUESTION,
    },
    UpdateExpression: `SET ` + allUpdateExpressions.join(", "),
    ExpressionAttributeValues: allAttributeValues,
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
