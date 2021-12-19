import { SQSEvent } from "aws-lambda";
import { EMAILS } from "../Config";
import errorFormatter from "../utils/errorFormatter";
import * as Time from "../utils/time";
import sendEmail from "../utils/sendEmail";
import { parse } from "../utils/SQSParser";
// TODO partial processing is here!! https://aws.amazon.com/about-aws/whats-new/2021/11/aws-lambda-partial-batch-response-sqs-event-source/#:~:text=With%20this%20feature%2C%20when%20messages,of%20only%20the%20failed%20records.&text=There%20are%20no%20additional%20charges,standard%20Lambda%20price%20for%20Lambda.
/**
 * For users logging in with an email (not Google log in)
 * this function will send them their login link via SES
 */
export async function main(event: SQSEvent) {
  const record = event.Records[0]; // todo change if batch size changes
  const item = parse(record).NewImage;
  const email = item.email.S;
  const loginLinkUrl = item.loginLinkUrl.S;
  const relativeExpiry = item.relativeExpiry.S;
  const unsubscribeHash = item.unsubscribeHash.S;
  const [emailSent, emailFailure] = await sendEmail({
    fromName: "Plutomi",
    fromAddress: EMAILS.GENERAL,
    toAddresses: [email],
    subject: `Your magic login link is here!`,
    html: `<h1>Click <a href="${loginLinkUrl}" noreferrer target="_blank" >this link</a> to log in!</h1><p>It will expire ${relativeExpiry} so you better hurry :)</p><p>If you did not request this link, you can safely ignore it and <a href="${process.env.API_URL}/unsubscribe/${unsubscribeHash}" noreferrer target="_blank" >unsubscribe</a>.</p>`,
  });

  if (emailFailure) {
    // TODO DLQ
    const formattedError = errorFormatter(emailFailure);
    console.error(formattedError);
    throw new Error("Unable to send login link");
  }

  console.log("Login link sent!");
  return;
}
