import { DynamoDBStreamEvent } from "aws-lambda";
import errorFormatter from "../utils/errorFormatter";
import EBClient from "../awsClients/eventBridgeClient";
import {
  PutEventsCommand,
  PutEventsCommandInput,
} from "@aws-sdk/client-eventbridge";
const processor = require("dynamodb-streams-processor");
import { PutEventsRequestEntry } from "aws-sdk/clients/eventbridge";

export async function main(event: DynamoDBStreamEvent) {
  // Was reading a bit and this came up https://github.com/aws/aws-sdk-js/issues/2486
  const record = processor(event.Records)[0];
  const { eventName } = record;
  const { OldImage, NewImage } = record.dynamodb;
  const entry: PutEventsRequestEntry = {
    Source: "dynamodb.streams",
    // Note, if we ever use AWS events directly, they will go to the default event bus and not this one.
    // This is for easy dev / prod testing
    EventBusName: `${process.env.NODE_ENV}-EventBus`,
    DetailType: "stream",
    Detail: JSON.stringify({
      eventName,
      OldImage,
      NewImage,
    }),
  };

  const newEvent: PutEventsCommandInput = {
    Entries: [entry],
  };
  try {
    console.log(entry);
    await EBClient.send(new PutEventsCommand(newEvent));
    console.log("Message sent to EventBridge!");

    return;
  } catch (error) {
    console.error("Unable to send message to EventBridge");
    console.error(errorFormatter(error));
    return;
  }
}
