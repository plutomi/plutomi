import {
  DeleteCommand,
  DeleteCommandInput,
  TransactWriteCommand,
  TransactWriteCommandInput,
} from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../lib/awsClients/ddbDocClient";
const { DYNAMO_TABLE_NAME } = process.env;
import { DeleteStage } from "../stages/deleteStage";
import { GetAllStagesInOpening } from "../stages/getAllStagesInOpening";
// TODO check if stage is empt of appliants first
// TODO delete stage from the funnels sort order
export async function DeleteOpening({ org_id, openingId }) {
  const all_stages = await GetAllStagesInOpening(org_id, openingId);

  try {
    // Delete stages first
    if (all_stages.length > 0) {
      console.log("Deleting stages");
      all_stages.map(async (stage: DynamoStage) => {
        // TODO add to SQS & delete applicants, rules, questions, etc.
        const input = {
          org_id: org_id,
          openingId: openingId,
          stage_id: stage.stage_id,
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
              PK: `ORG#${org_id}#OPENING#${openingId}`,
              SK: `OPENING`,
            },
            TableName: DYNAMO_TABLE_NAME,
          },
        },
        {
          // Decrement the org's total openings
          Update: {
            Key: {
              PK: `ORG#${org_id}`,
              SK: `ORG`,
            },
            TableName: DYNAMO_TABLE_NAME,
            UpdateExpression: "SET total_openings = total_openings - :value",
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
