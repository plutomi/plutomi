import {
  DeleteCommand,
  DeleteCommandInput,
  TransactWriteCommand,
  TransactWriteCommandInput,
} from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../awsClients/ddbDocClient";
const { DYNAMO_TABLE_NAME } = process.env;
import { DeleteStage } from "../stages/deleteStage";
import { GetAllStagesInOpening } from "../stages/getAllStagesInOpening";
// TODO check if stage is empt of appliants first
// TODO delete stage from the funnels sort order
export async function DeleteOpening({ orgId, openingId }) {
  const all_stages = await GetAllStagesInOpening(orgId, openingId);

  try {
    // Delete stages first
    if (all_stages.length > 0) {
      console.log("Deleting stages");
      all_stages.map(async (stage: DynamoStage) => {
        // TODO add to SQS & delete applicants, rules, questions, etc.
        const input = {
          orgId: orgId,
          openingId: openingId,
          stageId: stage.stageId,
        };
        await DeleteStage(input);
      });
    }

    console.log("Deleting funnel");

    const transactParams: TransactWriteCommandInput = {
      TransactItems: [
        {
          // Delete the opening
          Delete: {
            Key: {
              PK: `ORG#${orgId}#OPENING#${openingId}`,
              SK: `OPENING`,
            },
            TableName: DYNAMO_TABLE_NAME,
          },
        },
        {
          // Decrement the org's total openings
          Update: {
            Key: {
              PK: `ORG#${orgId}`,
              SK: `ORG`,
            },
            TableName: DYNAMO_TABLE_NAME,
            UpdateExpression: "SET totalOpenings = totalOpenings - :value",
            ExpressionAttributeValues: {
              ":value": 1,
            },
          },
        },
      ],
    };

    await Dynamo.send(new TransactWriteCommand(transactParams));
    return;
  } catch (error) {
    throw new Error(error);
  }
}
