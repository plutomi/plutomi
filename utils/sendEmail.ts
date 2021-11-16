import { SendEmailCommand, SendEmailCommandInput } from "@aws-sdk/client-ses";
import SESclient from "../awsClients/sesClient";

export default async function sendEmail({
  fromName,
  fromAddress,
  toAddresses,
  subject,
  html,
}) {
  const newEmail: SendEmailCommandInput = {
    Source: `${fromName} <${fromAddress}>`,
    Destination: {
      ToAddresses: toAddresses,
      CcAddresses: null,
      BccAddresses: null,
    },
    Message: {
      Subject: {
        Data: subject,
      },
      Body: {
        Html: {
          Data: html,
        },
      },
    },
  };
  try {
    await SESclient.send(new SendEmailCommand(newEmail));
  } catch (error) {
    console.error(error);
    throw new Error(`Unable to send email - ${error}`);
  }
}
