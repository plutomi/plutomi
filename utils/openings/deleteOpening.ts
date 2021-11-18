import {
  DeleteCommand,
  DeleteCommandInput,
  TransactWriteCommand,
  TransactWriteCommandInput,
} from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../awsClients/ddbDocClient";
import { ENTITY_TYPES } from "../../defaults";
import { DeleteOpeningInput } from "../../types/main";
const { DYNAMO_TABLE_NAME } = process.env;
import { deleteStage } from "../stages/deleteStage";
import { getAllStagesInOpening } from "./getAllStagesInOpening";
// TODO check if stage is empt of appliants first
// TODO delete stage from the funnels sort order
export async function deleteOpening(props: DeleteOpeningInput): Promise<void> {
  const { orgId, openingId } = props;
  const allStages = await getAllStagesInOpening({ orgId, openingId }); // TODO we dont have to query this anymore!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

  try {
    // Delete stages first
    if (allStages.length > 0) {
      console.log("Deleting stages");
      allStages.map(async (stage) => {
        // TODO add to SQS & delete applicants, rules, questions, etc.
        const input = {
          orgId: orgId,
          openingId: openingId,
          stageId: stage.stageId,
        };
        await deleteStage(input);
      });
    }

    console.log("Deleting funnel");

    const transactParams: TransactWriteCommandInput = {
      TransactItems: [
        {
          // Delete the opening
          Delete: {
            Key: {
              PK: `${ENTITY_TYPES.ORG}#${orgId}#${ENTITY_TYPES.OPENING}#${openingId}`,
              SK: `${ENTITY_TYPES.OPENING}`,
            },
            TableName: DYNAMO_TABLE_NAME,
          },
        },
        {
          // Decrement the org's total openings
          Update: {
            Key: {
              PK: `${ENTITY_TYPES.ORG}#${orgId}`,
              SK: `${ENTITY_TYPES.ORG}`,
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
