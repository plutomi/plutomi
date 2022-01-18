import { QueryCommandInput, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { UpdateCommandInput, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../awsClients/ddbDocClient";
import { ENTITY_TYPES, FORBIDDEN_PROPERTIES } from "../../Config";
import { DynamoNewStage } from "../../types/dynamo";
import { GetAllStagesInOpeningInput } from "../../types/main";
const { DYNAMO_TABLE_NAME } = process.env;
import { SdkError } from "@aws-sdk/types";
export default async function GetStages(
  props: GetAllStagesInOpeningInput
): Promise<[DynamoNewStage[], null] | [null, SdkError]> {
  const { orgId, openingId } = props;

  const params: QueryCommandInput = {
    TableName: DYNAMO_TABLE_NAME,
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

    console.log("All stages in opening", allStages);
    let orderedStages = [];

    // Stages are essentially a doubly linked list. This orders them.
    // TODO abstract this to its own function as we will need it for other entities that can be re-orderd
    if (allStages.length > 1) {
      console.log("More than one stage, ordering...");

      const first = allStages.find((stage) => stage.previousStage === null);
      const last = allStages.find((stage) => stage.nextStage === null);

      orderedStages.push(first);
      let current = allStages.find(
        (stage) => stage.stageId === first.nextStage
      );
      console.log("First stage:", first);

      while (current.nextStage) {
        console.log("There are more stages");
        console.log("Current stage:", current);
        const nextStage = allStages.find(
          (stage) => stage.stageId === current.nextStage
        );
        console.log("Next stage:", nextStage);

        orderedStages.push(current);
        current = nextStage;
      }

      orderedStages.push(last);
    }

    return [allStages.length === 1 ? allStages : orderedStages, null];
  } catch (error) {
    return [null, error];
  }
}
