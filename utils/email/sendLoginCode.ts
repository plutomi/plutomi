import { SendEmailCommand, SendEmailCommandInput } from "@aws-sdk/client-ses";
import SES from "../../libs/sesClient";

export default async function SendLoginCode({
  recipient,
  login_code,
  login_code_relative_expiry,
}: SendLoginCodeEmailInput) {
  const new_email: SendEmailCommandInput = {
    Source: `Plutomi <login@plutomi.com>`,
    Destination: {
      ToAddresses: [recipient.toLowerCase()],
      CcAddresses: null,
      BccAddresses: null,
    },
    Message: {
      Subject: {
        Data: `Your login code is ${login_code}`,
      },
      Body: {
        Html: {
          Data: `<h1>${login_code}</h1><br>It will expire ${login_code_relative_expiry} so enter it soon.`,
        },
      },
    },
  };
  try {
    await SES.send(new SendEmailCommand(new_email));
  } catch (error) {
    console.error(error);
    throw new Error(`Unable to send login code - ${error}`);
  }
}
