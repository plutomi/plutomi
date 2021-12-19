import { DynamoDBStreamEvent } from "aws-lambda";
import { ENTITY_TYPES, LOGIN_METHODS, STREAM_EVENTS } from "../Config";
import { PublishCommand, PublishCommandInput } from "@aws-sdk/client-sns";
import SNSclient from "../awsClients/snsClient";
import errorFormatter from "../utils/errorFormatter";
import EBClient from "../awsClients/eventBridgeClient";

const processor = require("dynamodb-streams-processor");

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
  return;
  const { eventName } = record;

  let { OldImage } = record.dynamodb;
  let { NewImage } = record.dynamodb;
  console.log({
    eventName: eventName,
    OldImage: OldImage,
    NewImage: NewImage,
  });

  return;
  /**
   * The logic below describes what 'rules' need to match for each event type to be processed
   */

  // Send a user a link to login via email
  const SEND_LOGIN_LINK =
    eventName === "INSERT" &&
    NewImage.entityType === ENTITY_TYPES.LOGIN_LINK &&
    NewImage.loginMethod === LOGIN_METHODS.EMAIL;

  /**
   * If a user logs in for the first time, asynchronously notify the app Admin
   * This will go to 2 separate queues, one for sending the email and one for updating the user's verifiedEmail property
   */
  const NEW_USER =
    eventName === "INSERT" &&
    NewImage.entityType === ENTITY_TYPES.LOGIN_EVENT &&
    !NewImage.verifiedEmail.BOOL;

  // Attributes are what we use to filter in SNS and the corresponding downstream queues
  let attributes: {
    // TODO split to its own type
    eventType: {
      DataType: string;
      StringValue: STREAM_EVENTS;
    };
  };

  if (SEND_LOGIN_LINK) {
    console.log("User is requesting to log in");
    attributes = {
      eventType: {
        DataType: "String",
        StringValue: STREAM_EVENTS.SEND_LOGIN_LINK,
      },
    };
  }

  if (NEW_USER) {
    console.log("A new user has signed up");
    attributes = {
      eventType: {
        DataType: "String",
        StringValue: STREAM_EVENTS.NEW_USER,
      },
    };
  }
  // No match - We don't care about this event
  if (!attributes) {
    return;
  }
  const snsMessage: PublishCommandInput = {
    // Message attributes are sent only when the message structure is String, not JSON.
    // https://docs.aws.amazon.com/sns/latest/dg/sns-message-attributes.html
    Message: JSON.stringify(record),
    MessageAttributes: attributes,
    TopicArn: process.env.STREAM_PROCESSOR_TOPIC_ARN, // Set in CDK in the lambda environment variables - NOT in .env file
  };
  try {
    await SNSclient.send(new PublishCommand(snsMessage));
    console.log("Message sent to SNS!");
    console.log(snsMessage);
    return;
  } catch (error) {
    console.error("Unable to send message to SNS");
    console.error(errorFormatter(error));
    return;
  }
}
