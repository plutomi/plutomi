import { SQSEvent } from "aws-lambda";
import { EMAILS, ENTITY_TYPES, LOGIN_METHODS, STREAM_EVENTS } from "../Config";
import SNSclient from "../awsClients/snsClient";
import { PublishCommand, PublishCommandInput } from "@aws-sdk/client-sns";
import errorFormatter from "../utils/errorFormatter";
import * as Time from "../utils/time";
import sendEmail from "../utils/sendEmail";

// TODO partial processing is here!! https://aws.amazon.com/about-aws/whats-new/2021/11/aws-lambda-partial-batch-response-sqs-event-source/#:~:text=With%20this%20feature%2C%20when%20messages,of%20only%20the%20failed%20records.&text=There%20are%20no%20additional%20charges,standard%20Lambda%20price%20for%20Lambda.

/**
 * For users logging in with an email (not Google log in)
 * this function will send them their login link via SES
 */
export async function main(event: SQSEvent) {
  const record = event.Records[0]; // todo change if batch size changes
  const message = JSON.parse(record.body).message;
  console.log("THIS SHOULD BE A LOGIN EVENT", record, message);

  console.log("MESSAGE ONLY");

  console.log(message);
  // const [emailSent, emailFailure] = await sendEmail({
  //   fromName: "Plutomi",
  //   fromAddress: EMAILS.GENERAL,
  //   toAddresses: [email],
  //   subject: `Your magic login link is here!`,
  //   html: `<h1><a href="${loginLinkUrl}" noreferrer target="_blank" >Click this link to log in</a></h1><p>It will expire ${Time.relative(
  //     new Date(loginLinkExpiry)
  //   )}.</p><p>If you did not request this link, you can safely ignore it and unsubscribe here: ${
  //     process.env.API_URL // TODO add URL
  //   }/unsubscribe/${unsubscribeHash}</p>`,
  // });

  // if (emailFailure) {
  //   const formattedError = errorFormatter(emailFailure);
  //   console.error("An error ocurred sending your login link", formattedError);
  // }

  // TODO send login link here
  return;
}
