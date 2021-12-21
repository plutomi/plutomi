import { DynamoDBStreamEvent } from "aws-lambda";
import errorFormatter from "../utils/errorFormatter";
import EBClient from "../awsClients/eventBridgeClient";
import {
  PutEventsCommand,
  PutEventsCommandInput,
} from "@aws-sdk/client-eventbridge";
const processor = require("dynamodb-streams-processor");
import { PutEventsRequestEntry } from "aws-sdk/clients/eventbridge";
/**
 * Sends messages to an SNS topic.
 * We do most of our filtering here so we don't even have to call SNS if it isn't needed.
 * SNS then fans out to a corresponding SQS queue on each event
 * Reading: https://stackabuse.com/publishing-and-subscribing-to-aws-sns-messages-with-node-js/
 *
 */
export async function main(event: DynamoDBStreamEvent) {
  // Was reading a bit and this came up https://github.com/aws/aws-sdk-js/issues/2486
  const record = processor(event.Records)[0];

  console.log(record);
  const { eventName } = record;
  const { OldImage, NewImage } = record.dynamodb;
  const entry = {
    Source: "dynamodb.streams",
    DetailType: "stream", // Was having issues if this wasn't specified - can be anything
    Detail: JSON.stringify({
      eventName: eventName,
      OldImage: OldImage,
      NewImage: NewImage,
    }),
  };

  const newEvent: PutEventsCommandInput = {
    Entries: [entry],
  };
  try {
    await EBClient.send(new PutEventsCommand(newEvent));
    console.log("Message sent to EventBridge!");
    console.log(entry);
    return;
  } catch (error) {
    console.error("Unable to send message to EventBridge");
    console.error(errorFormatter(error));
    return;
  }
}
