import { DynamoDBStreamEvent } from "aws-lambda";
import { ENTITY_TYPES, LOGIN_METHODS, STREAM_EVENTS } from "../Config";
import { PublishCommand, PublishCommandInput } from "@aws-sdk/client-sns";
import SNSclient from "../awsClients/snsClient";
import errorFormatter from "../utils/errorFormatter";
import EBClient from "../awsClients/eventBridgeClient";
import {
  PutEventsCommand,
  PutEventsCommandInput,
} from "@aws-sdk/client-eventbridge";
const processor = require("dynamodb-streams-processor");
import * as Time from "../utils/time";
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

  console.log("New, formatted record");
  console.log(record);
  const { eventName } = record;
  const { OldImage, NewImage } = record.dynamodb;
  console.log({
    eventName: eventName,
    OldImage: OldImage,
    NewImage: NewImage,
  });

  /**
   * First, we're going to define some events & the criteria that is needed for them to trigger
   * We don't really want to send *everything* to EventBridge, we don't have a use for it at this time.
   * When that time comes, we can delete all this code and setup rules on EB directly :)
   */

  // User requested a login lnk
  const REQUEST_LOGIN_LINK =
    eventName === "INSERT" &&
    NewImage.entityType === ENTITY_TYPES.LOGIN_LINK &&
    NewImage.loginMethod === LOGIN_METHODS.EMAIL;

  /**
   * User verified their email
   */
  const NEW_USER =
    eventName === "INSERT" &&
    NewImage.entityType === ENTITY_TYPES.LOGIN_EVENT &&
    !NewImage.verifiedEmail;

  let entry: { Source: string; Detail: string; DetailType: string } | undefined;

  if (REQUEST_LOGIN_LINK) {
    console.log("User is requesting to log in");
    entry = {
      Source: "dynamodb.streams",
      Detail: JSON.stringify(NewImage),
      DetailType: STREAM_EVENTS.REQUEST_LOGIN_LINK,
    };
  }

  if (NEW_USER) {
    console.log("A new user has signed up");
    entry = {
      Source: "dynamodb.streams",
      Detail: JSON.stringify(NewImage),
      DetailType: STREAM_EVENTS.NEW_USER,
    };
  }

  // No match - We don't care about this event
  if (!entry) {
    return;
  }

  const newEvent: PutEventsCommandInput = {
    Entries: [entry],
  };
  try {
    await EBClient.send(new PutEventsCommand(newEvent));
    console.log("Message sent to EventBridge!");
    return;
  } catch (error) {
    console.error("Unable to send message to EventBridge");
    console.error(errorFormatter(error));
    return;
  }
}
