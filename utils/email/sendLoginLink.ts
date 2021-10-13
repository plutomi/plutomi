import { SendEmailCommand, SendEmailCommandInput } from "@aws-sdk/client-ses";
import SES from "../../libs/sesClient";

export default async function SendLoginLink({
  recipient,
  login_link,
  login_link_relative_expiry,
}: SendLoginLinkEmailInput) {
  const new_email: SendEmailCommandInput = {
    Source: `Plutomi <login@plutomi.com>`,
    Destination: {
      ToAddresses: [recipient.toLowerCase()],
      CcAddresses: null,
      BccAddresses: null,
    },
    Message: {
      Subject: {
        Data: `Your magic login link is here!`,
      },
      Body: {
        Html: {
          Data: `<h1><a href="${login_link}" noreferrer target="_blank" >Click this link to log in</a></h1><p>It will expire ${login_link_relative_expiry}. <strong>DO NOT SHARE THIS LINK WITH ANYONE!!!</strong></p><p>If you did not request this link, you can safely ignore it.</p>`,
        },
      },
    },
  };

  console.log(JSON.stringify(new_email));
  try {
    await SES.send(new SendEmailCommand(new_email));
  } catch (error) {
    console.error(error);
    throw new Error(`Unable to send login link - ${error}`);
  }
}
