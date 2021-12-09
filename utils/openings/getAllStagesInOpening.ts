import { QueryCommand, QueryCommandInput } from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../awsClients/ddbDocClient";
import { ENTITY_TYPES } from "../../Config";
import { DynamoNewStage } from "../../types/dynamo";
import { GetAllStagesInOpeningInput } from "../../types/main";

const { DYNAMO_TABLE_NAME } = process.env;

export async function getAllStagesInOpening(
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
