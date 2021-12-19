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
  // TODO unmarshall the events >:[
  event.Records.map(async (record) => {
    const { eventName } = record;
    const { OldImage } = record.dynamodb;
    const { NewImage } = record.dynamodb;

    console.log({
      eventName: eventName,
      OldImage: OldImage,
      NewImage: NewImage,
    });

    /**
     * The logic below describes what 'rules' need to match for each event type to be processed
     */

    // Send a user a link to login via email
    const SEND_LOGIN_LINK =
      eventName === "INSERT" &&
      NewImage.entityType.S === ENTITY_TYPES.LOGIN_LINK &&
      NewImage.loginMethod.S === LOGIN_METHODS.EMAIL;

    // If a user logs in for the first time, send it to an queue to notify the app owner
    const NEW_USER =
      eventName === "INSERT" &&
      NewImage.entityType.S === ENTITY_TYPES.LOGIN_EVENT &&
      !NewImage.verifiedEmail.BOOL; // <-- The queue will update this to true after they log in for the first time

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
          StringValue: STREAM_EVENTS.USER_LOGIN,
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
  });
}
