import { QueryCommand, QueryCommandInput } from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../lib/awsClients/ddbDocClient";
import { GetOpening } from "../openings/getOpeningById";
const { DYNAMO_TABLE_NAME } = process.env;

export async function GetAllStagesInOpening(orgId: string, openingId: string) {
  const opening = await GetOpening({ orgId, openingId });
  const { stage_order } = opening;

  const params: QueryCommandInput = {
    TableName: DYNAMO_TABLE_NAME,
    IndexName: "GSI1",
    KeyConditionExpression: "GSI1PK = :GSI1PK",
    ExpressionAttributeValues: {
      ":GSI1PK": `ORG#${orgId}#OPENING#${openingId}#STAGES`,
    },
  };

  try {
    const response = await Dynamo.send(new QueryCommand(params));
    const all_stages = response.Items;

    const result = stage_order.map((i) =>
      all_stages.find((j) => j.stageId === i)
    );

    return result;
  } catch (error) {
    throw new Error(error);
  }
}
