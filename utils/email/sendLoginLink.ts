import { SendEmailCommand, SendEmailCommandInput } from "@aws-sdk/client-ses";
import SES from "../../awsClients/sesClient";

export default async function SendLoginLink({
  recipientEmail,
  loginLink,
  loginLinkRelativeExpiry,
}) {
  const newEmail: SendEmailCommandInput = {
    Source: `Plutomi <login@plutomi.com>`,
    Destination: {
      ToAddresses: [recipientEmail],
      CcAddresses: null,
      BccAddresses: null,
    },
    Message: {
      Subject: {
        Data: `Your magic login link is here!`,
      },
      Body: {
        Html: {
          Data: `<h1><a href="${loginLink}" noreferrer target="_blank" >Click this link to log in</a></h1><p>It will expire ${loginLinkRelativeExpiry}. <strong>DO NOT SHARE THIS LINK WITH ANYONE!!!</strong></p><p>If you did not request this link, you can safely ignore it.</p>`,
        },
      },
    },
  };

  try {
    await SES.send(new SendEmailCommand(newEmail));
  } catch (error) {
    console.error(error);
    throw new Error(`Unable to send login link - ${error}`);
  }
}
