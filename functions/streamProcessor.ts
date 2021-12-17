import { DynamoDBStreamEvent } from "aws-lambda";
import { ENTITY_TYPES, LOGIN_METHODS, STREAM_EVENTS } from "../Config";
import SNSclient from "../awsClients/snsClient";
import { PublishCommand, PublishCommandInput } from "@aws-sdk/client-sns";
import errorFormatter from "../utils/errorFormatter";

/**
 * Sends messages to an SNS topic.
 * We do most of our filtering here so we don't even have to call SNS if it isn't needed.
 * SNS then fans out to a corresponding SQS queue on each event
 * Reading: https://stackabuse.com/publishing-and-subscribing-to-aws-sns-messages-with-node-js/
 *
 */
export async function main(event: DynamoDBStreamEvent) {
  const record = event.Records[0]; // todo change if batch size changes
  const eventName = record.eventName;
  const oldItem = record.dynamodb.OldImage;
  const newItem = record.dynamodb.NewImage;
  let attributes;
  // TODO recently released, filtering from streams -> Lambda so we don't have to do these checks
  const SEND_LOGIN_LINK =
    eventName === "INSERT" &&
    newItem.entityType.S === ENTITY_TYPES.LOGIN_LINK &&
    newItem.loginMethod.S === LOGIN_METHODS.EMAIL;

  if (SEND_LOGIN_LINK) {
    console.log("User is requesting to log in", newItem);
    attributes = {
      eventType: {
        DataType: "String",
        StringValue: STREAM_EVENTS.SEND_LOGIN_LINK,
      },
    };
  }
  try {
    const snsMessage: PublishCommandInput = {
      Message: JSON.stringify(record),
      MessageAttributes: attributes,
      TopicArn: process.env.STREAM_PROCESSOR_TOPIC_ARN, // Set in CDK in the lambda environment variables - NOT in .env file
    };
    await SNSclient.send(new PublishCommand(snsMessage));
    return;
  } catch (error) {
    const formattedError = errorFormatter(error);
    console.error(formattedError);
    return;
  }

  // if (eventName === "MODIFY") {
  // }

  // if (eventName === "REMOVE") {
  // }
}
