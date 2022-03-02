import { QueryCommandInput, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../awsClients/ddbDocClient";
import { DYNAMO_TABLE_NAME, ENTITY_TYPES } from "../../Config";
import { DynamoStage } from "../../types/dynamo";
import { GetStagesInOpeningInput } from "../../types/main";
import { SdkError } from "@aws-sdk/types";
export default async function GetStages(
  props: GetStagesInOpeningInput
): Promise<[DynamoStage[], SdkError]> {
  const { orgId, openingId, stageOrder } = props;

  const params: QueryCommandInput = {
    TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,
    IndexName: "GSI1",
    KeyConditionExpression: "GSI1PK = :GSI1PK",
    ExpressionAttributeValues: {
      ":GSI1PK": `${ENTITY_TYPES.ORG}#${orgId}#${ENTITY_TYPES.OPENING}#${openingId}#${ENTITY_TYPES.STAGE}S`,
    },
  };

  try {
    const response = await Dynamo.send(new QueryCommand(params));
    const allStages = response.Items as DynamoStage[];

    // Orders results in the way the stageOrder is
    const result = stageOrder.map((i: string) =>
      allStages.find((j) => j.stageId === i)
    );
    return [result as DynamoStage[], null];
  } catch (error) {
    return [null, error];
  }
}
