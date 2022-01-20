import { UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../AWSClients/ddbDocClient";
import { FORBIDDEN_PROPERTIES, ENTITY_TYPES } from "../../Config";
import { UpdateStageInput } from "../../types/main";
const { DYNAMO_TABLE_NAME } = process.env;
import { SdkError } from "@aws-sdk/types";
export default async function Update(
  props: UpdateStageInput
): Promise<[null, null] | [null, SdkError]> {
  const { orgId, stageId, newValues, openingId } = props;

  // Build update expression
  let allUpdateExpressions: string[] = [];
  let allAttributeValues: { [key: string]: string } = {};

  for (const property in newValues) {
    // Push each property into the update expression
    allUpdateExpressions.push(`${property} = :${property}`);

    // Create values for each attribute
    allAttributeValues[`:${property}`] = newValues[property];
  }

  const params = {
    Key: {
      PK: `${ENTITY_TYPES.ORG}#${orgId}#${ENTITY_TYPES.OPENING}#${openingId}#${ENTITY_TYPES.STAGE}#${stageId}`,
      SK: ENTITY_TYPES.STAGE,
    },
    UpdateExpression: `SET ` + allUpdateExpressions.join(", "),
    ExpressionAttributeValues: allAttributeValues,
    TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,

    ConditionExpression: "attribute_exists(PK)",
  };

  try {
    await Dynamo.send(new UpdateCommand(params));
    return [null, null];
  } catch (error) {
    return [null, error];
  }
}
