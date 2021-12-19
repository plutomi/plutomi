import { SQSEvent } from "aws-lambda";
import errorFormatter from "../utils/errorFormatter";
import { parse } from "../utils/SQSParser";
import * as Users from "../models/Users";
// TODO partial processing is here!! https://aws.amazon.com/about-aws/whats-new/2021/11/aws-lambda-partial-batch-response-sqs-event-source/#:~:text=With%20this%20feature%2C%20when%20messages,of%20only%20the%20failed%20records.&text=There%20are%20no%20additional%20charges,standard%20Lambda%20price%20for%20Lambda.
/**
 * For users logging in with an email (not Google log in)
 * this function will send them their login link via SES
 */
export async function main(event: SQSEvent) {
  const item = JSON.parse(event.Records[0].body).detail;
  const { userId } = item;

  const [update, error] = await Users.updateUser({
    userId: userId,
    ALLOW_FORBIDDEN_KEYS: true,
    newUserValues: {
      verifiedEmail: true,
    },
  });
  if (error) {
    // TODO DLQ
    const formattedError = errorFormatter(error);
    console.error(formattedError);
    throw new Error("Unable to update user with verified email");
  }

  console.log("User updated!");
  return;
}
