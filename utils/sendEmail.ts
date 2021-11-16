import { SendEmailCommand, SendEmailCommandInput } from "@aws-sdk/client-ses";
import SESclient from "../awsClients/sesClient";

export default async function sendEmail({
  fromName, // TODO add types
  fromAddress,
  toAddresses,
  subject,
  html,
}) {
  // Add it to the beginning so we only have to lower case and trim once
  toAddresses.unshift(fromAddress);
  const cleanAddresses = toAddresses.map((email: string) =>
    email.toLowerCase().trim()
  );
  const newEmail: SendEmailCommandInput = {
    Source: `${fromName} <${cleanAddresses.shift()}>`,
    Destination: {
      ToAddresses: cleanAddresses,
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
