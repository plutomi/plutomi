import { DynamoDBStreamEvent } from "aws-lambda";
import errorFormatter from "../utils/errorFormatter";
import EBClient from "../AWSClients/eventBridgeClient";
import {
  PutEventsCommand,
  PutEventsCommandInput,
} from "@aws-sdk/client-eventbridge";
const processor = require("dynamodb-streams-processor");
import { PutEventsRequestEntry } from "aws-sdk/clients/eventbridge";
import * as Questions from "../models/Questions";

/**
 * MAJOR TODO -
 * I really don't think this lambda is needed.
 * Have to figure out a way to edit an array with JSONPath directly, im sure its possible
 */
export async function main(event) {
  // TODO types
  console.log(JSON.stringify(event));

  const item = event[0].stage.stage.questionOrder.L.find(
    (item) => item.S === event[0].questionId
  );
  const deleteIndex = event[0].stage.stage.questionOrder.L.indexOf(item);
  console.log("Delete index", deleteIndex);
  const input = {
    decrementStageCount: false,
    openingId: event[0].stage.stage.openingId.S,
    orgId: event[0].stage.stage.orgId.S,
    questionId: event[0].questionId,
    stageId: event[0].stage.stage.stageId.S,
    deleteIndex,
  };

  console.log(input);
  const [removed, error] = await Questions.DeleteQuestionFromStage(input);

  if (error) {
    console.error(error);
    return;
  }

  console.log("Removed!");
  return;
}
