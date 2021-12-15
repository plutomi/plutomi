import {
  TransactWriteCommandInput,
  TransactWriteCommand,
} from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../awsClients/ddbDocClient";
import { ENTITY_TYPES } from "../../Config";
import { DeleteOpeningInput } from "../../types/main";
const { DYNAMO_TABLE_NAME } = process.env;
import * as Openings from ".";
import * as Stages from "../Stages";
import { SdkError } from "@aws-sdk/types";
export default async function remove(
  props: DeleteOpeningInput
): Promise<[null, null] | [null, SdkError]> {
  const { orgId, openingId } = props;
  // TODO we should not be doing this here!!!
  const allStages = await Openings.getStagesInOpening({ orgId, openingId }); // TODO we dont have to query this anymore!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

  try {
    // Delete stages first
    if (allStages.length) {
      allStages.map(async (stage) => {
        // TODO add to SQS & delete applicants, rules, questions, etc.
        const input = {
          orgId: orgId,
          openingId: openingId,
          stageId: stage.stageId,
        };
        await Stages.deleteStage(input); // TODO we should not be doing this her
      });
    }

    const transactParams: TransactWriteCommandInput = {
      TransactItems: [
        {
          // Delete the opening
          Delete: {
            Key: {
              PK: `${ENTITY_TYPES.ORG}#${orgId}#${ENTITY_TYPES.OPENING}#${openingId}`,
              SK: ENTITY_TYPES.OPENING,
            },
            TableName: DYNAMO_TABLE_NAME,
          },
        },
        {
          // Decrement the org's total openings
          Update: {
            Key: {
              PK: `${ENTITY_TYPES.ORG}#${orgId}`,
              SK: ENTITY_TYPES.ORG,
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
    return [null, null];
  } catch (error) {
    return [null, error];
  }
}
