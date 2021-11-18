import { UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../awsClients/ddbDocClient";
import { ENTITY_TYPES } from "../../defaults";
import { UpdateStageInput } from "../../types/main";
const { DYNAMO_TABLE_NAME } = process.env;

export default async function updateStage(
  props: UpdateStageInput
): Promise<void> {
  const { orgId, stageId, newStageValues } = props;
  // TODO user the cleaning functions instead
  const FORBIDDEN_KEYS = [
    "PK",
    "SK",
    "orgId",
    "entityType",
    "createdAt",
    "stageId",
    "GSI1PK",
  ];

  const incomingKeys = Object.keys(newStageValues);
  // TODO should this throw an error and
  // let the user know we can't update that key?
  // Maybe just return in the message that we weren't able to update those keys
  const newKeys = incomingKeys.filter((key) => !FORBIDDEN_KEYS.includes(key));

  // Build update expression
  let newUpdateExpression: string[] = [];
  let newAttributes: any = {};

  newKeys.forEach((key) => {
    newUpdateExpression.push(`${key} = :${key}`);
    newAttributes[`:${key}`] = newStageValues[key];
  });

  const UpdatedExpression = `SET ${newUpdateExpression.join(", ").toString()}`;

  const params = {
    Key: {
      PK: `${ENTITY_TYPES.ORG}#${orgId}#${ENTITY_TYPES.STAGE}#${stageId}`,
      SK: `${ENTITY_TYPES.STAGE}`,
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
