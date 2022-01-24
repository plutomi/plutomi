import { QueryCommandInput, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { UpdateCommandInput, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../AWSClients/ddbDocClient";
import { ENTITY_TYPES, FORBIDDEN_PROPERTIES } from "../../Config";
import { DynamoNewStage } from "../../types/dynamo";
import { GetAllStagesInOpeningInput } from "../../types/main";
const { DYNAMO_TABLE_NAME } = process.env;
import { SdkError } from "@aws-sdk/types";
import * as Openings from ".";
export default async function GetStages(
  props: GetAllStagesInOpeningInput
): Promise<[DynamoNewStage[], null] | [null, SdkError]> {
  const { orgId, openingId, stageOrder } = props;

  const params: QueryCommandInput = {
    TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,

    IndexName: "GSI1",
    KeyConditionExpression: "GSI1PK = :GSI1PK",
    ExpressionAttributeValues: {
      // Sorting is done through a double linked list unfortunately
      // Since the user can update the order at any time
      ":GSI1PK": `${ENTITY_TYPES.ORG}#${orgId}#${ENTITY_TYPES.OPENING}#${openingId}#${ENTITY_TYPES.STAGE}S`,
    },
  };

  try {
    const response = await Dynamo.send(new QueryCommand(params));
    const allStages = response.Items as DynamoNewStage[];

    // Orders results in the way the stageOrder is
    const result = stageOrder.map((i: string) =>
      allStages.find((j) => j.stageId === i)
    );
    return [result as DynamoNewStage[], null];
  } catch (error) {
    return [null, error];
  }
}
