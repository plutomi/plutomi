import { DynamoDBStreamEvent } from "aws-lambda";
import { ENTITY_TYPES, LOGIN_METHODS, STREAM_EVENTS } from "../Config";
import SNSclient from "../awsClients/snsClient";
import { PublishCommand, PublishCommandInput } from "@aws-sdk/client-sns";
import errorFormatter from "../utils/errorFormatter";
import { unmarshall } from "@aws-sdk/util-dynamodb";

/**
 * Sends messages to an SNS topic.
 * We do most of our filtering here so we don't even have to call SNS if it isn't needed.
 * SNS then fans out to a corresponding SQS queue on each event
 * Reading: https://stackabuse.com/publishing-and-subscribing-to-aws-sns-messages-with-node-js/
 *
 */
export async function main(event: DynamoDBStreamEvent) {
  // TODO unmarshall the events >:[
  // Was reading a bit and this came up https://github.com/aws/aws-sdk-js/issues/2486
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

    /**
     * If a user logs in for the first time, asynchronously notify the app Admin
     * This will go to 2 separate queues, one for sending the email and one for updating the user's verifiedEmail property
     */
    const NEW_USER =
      eventName === "INSERT" &&
      NewImage.entityType.S === ENTITY_TYPES.LOGIN_EVENT &&
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
    try {
      const snsMessage: PublishCommandInput = {
        // Message attributes are sent only when the message structure is String, not JSON.
        // https://docs.aws.amazon.com/sns/latest/dg/sns-message-attributes.html
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
