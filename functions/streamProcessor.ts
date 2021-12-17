import { DynamoDBStreamEvent } from "aws-lambda";
import { ENTITY_TYPES, LOGIN_METHODS } from "../Config";
import SNSclient from "../awsClients/snsClient";
import { PublishCommand, PublishCommandInput } from "@aws-sdk/client-sns";
import errorFormatter from "../utils/errorFormatter";

/**
 * Sends messages to an SNS topic
 */
export async function main(event: DynamoDBStreamEvent) {
  const record = event.Records[0]; // todo change if batch size changes

  console.log(record);
  try {
    const snsMessage: PublishCommandInput = {
      Message: JSON.stringify(record),
      TopicArn: process.env.STREAM_PROCESSOR_TOPIC_ARN, // Set in CDK in the lambda environment variables - NOT in .env file
    };
    await SNSclient.send(new PublishCommand(snsMessage));
    return;
  } catch (error) {
    const formattedError = errorFormatter(error);
    console.error(formattedError);
    return;
  }

  // if (eventName === "INSERT") {
  //   /**
  //    * When a user attempts to log in with their email, send a request to the email queue
  //    * When they click their login link their email will be verified.
  //    */
  //   if (
  //     newItem.entityType.S === ENTITY_TYPES.LOGIN_LINK &&
  //     newItem.linkType.S === LOGIN_METHODS.EMAIL
  //   ) {
  //     console.log("User trying to log in", JSON.stringify(newItem.NewImage));
  //   }
  // }

  // if (eventName === "MODIFY") {
  // }

  // if (eventName === "REMOVE") {
  // }
}
