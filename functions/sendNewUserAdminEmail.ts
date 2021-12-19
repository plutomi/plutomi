import { SQSEvent } from "aws-lambda";
import { EMAILS } from "../Config";
import errorFormatter from "../utils/errorFormatter";
import sendEmail from "../utils/sendEmail";
import { parse } from "../utils/SQSParser";
// TODO partial processing is here!! https://aws.amazon.com/about-aws/whats-new/2021/11/aws-lambda-partial-batch-response-sqs-event-source/#:~:text=With%20this%20feature%2C%20when%20messages,of%20only%20the%20failed%20records.&text=There%20are%20no%20additional%20charges,standard%20Lambda%20price%20for%20Lambda.
/**
 * For users logging in with an email (not Google log in)
 * this function will send them their login link via SES
 */
export async function main(event: SQSEvent) {
  const item = JSON.parse(event.Records[0].body).detail;

  const { userId, email } = item;

  const [emailSent, emailFailure] = await sendEmail({
    fromName: "Plutomi",
    fromAddress: EMAILS.ADMIN,
    toAddresses: [EMAILS.ADMIN],
    subject: `A new user has signed up!`,
    html: `<h3>New user ID: ${userId} - ${email}</h3>`,
  });

  if (emailFailure) {
    // TODO DLQ
    const formattedError = errorFormatter(emailFailure);
    console.error(formattedError);
    throw new Error("Unable to send new user email to admin");
  }

  console.log("Admin email sent!");
  return;
}
