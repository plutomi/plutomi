import { SQSEvent } from "aws-lambda";
import { ENTITY_TYPES, LOGIN_METHODS, STREAM_EVENTS } from "../Config";
import SNSclient from "../awsClients/snsClient";
import { PublishCommand, PublishCommandInput } from "@aws-sdk/client-sns";
import errorFormatter from "../utils/errorFormatter";

// TODO partial processing is here!! https://aws.amazon.com/about-aws/whats-new/2021/11/aws-lambda-partial-batch-response-sqs-event-source/#:~:text=With%20this%20feature%2C%20when%20messages,of%20only%20the%20failed%20records.&text=There%20are%20no%20additional%20charges,standard%20Lambda%20price%20for%20Lambda.

/**
 * For users logging in with an email (not Google log in)
 * this function will send them their link via SES
 */
export async function main(event: SQSEvent) {
  const record = event.Records[0]; // todo change if batch size changes
  const message = JSON.parse(record.body).message;
  console.log("THIS SHOULD BE A LOGIN EVENT", record, message);
  // TODO send login link here
  return;
}
