import { QueryCommandInput, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { UpdateCommandInput, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../awsClients/ddbDocClient";
import { ENTITY_TYPES, FORBIDDEN_PROPERTIES } from "../../Config";
import { DynamoNewStage } from "../../types/dynamo";
import {
  GetAllStagesInOpeningInput,
  UpdateOpeningInput,
} from "../../types/main";
const { DYNAMO_TABLE_NAME } = process.env;

export default async function getStages(
  props: GetAllStagesInOpeningInput
): Promise<DynamoNewStage[]> {
  const { orgId, openingId } = props;
  // TODO this should not be here, this should be in controller
  const opening = await getOpening({ orgId, openingId });
  const { stageOrder } = opening;

  const params: QueryCommandInput = {
    TableName: DYNAMO_TABLE_NAME,
    IndexName: "GSI1",
    KeyConditionExpression: "GSI1PK = :GSI1PK",
    ExpressionAttributeValues: {
      ":GSI1PK": `${ENTITY_TYPES.ORG}#${orgId}#${ENTITY_TYPES.OPENING}#${openingId}#${ENTITY_TYPES.STAGE}S`,
    },
  };

  try {
    const response = await Dynamo.send(new QueryCommand(params));
    const allStages = response.Items;

    const result = stageOrder.map((i: string) =>
      allStages.find((j) => j.stageId === i)
    );

    return result as DynamoNewStage[];
  } catch (error) {
    throw new Error(error);
  }
}

export const updateOpening = async (
  props: UpdateOpeningInput
): Promise<void> => {
  const { orgId, openingId, newOpeningValues } = props;
  // Build update expression
  let allUpdateExpressions: string[] = [];
  let allAttributeValues: any = {};

  // Filter out forbidden property
  for (const property in newOpeningValues) {
    if (FORBIDDEN_PROPERTIES.STAGE.includes(property)) {
      // Delete the property so it isn't updated
      delete newOpeningValues[property];
    }

    // If its a valid property, start creating the new update expression
    // Push each property into the update expression
    allUpdateExpressions.push(`${property} = :${property}`);

    // Create values for each attribute
    allAttributeValues[`:${property}`] = newOpeningValues[property];
  }

  const params: UpdateCommandInput = {
    Key: {
      PK: `${ENTITY_TYPES.ORG}#${orgId}#${ENTITY_TYPES.OPENING}#${openingId}`,
      SK: ENTITY_TYPES.OPENING,
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
};
