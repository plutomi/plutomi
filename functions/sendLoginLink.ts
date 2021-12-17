import { SQSEvent } from "aws-lambda";
import { ENTITY_TYPES, LOGIN_METHODS, STREAM_EVENTS } from "../Config";
import SNSclient from "../awsClients/snsClient";
import { PublishCommand, PublishCommandInput } from "@aws-sdk/client-sns";
import errorFormatter from "../utils/errorFormatter";

export async function main(event: SQSEvent) {
  const record = event.Records[0]; // todo change if batch size changes
  const message = JSON.parse(record.body).message;
  console.log("THIS SHOULD BE A LOGIN EVENT", record, message);
  // TODO send login link here
  return;
}
