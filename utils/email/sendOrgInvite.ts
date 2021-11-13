import { SendEmailCommand, SendEmailCommandInput } from "@aws-sdk/client-ses";
import SES from "../../awsClients/sesClient";

export default async function sendOrgInvite({
  recipientEmail,
  createdBy,
  orgName,
}) {
  const newEmail: SendEmailCommandInput = {
    Source: `Plutomi <join@plutomi.com>`,
    Destination: {
      ToAddresses: [recipientEmail.toLowerCase().trim()],
      CcAddresses: null,
      BccAddresses: null,
    },
    Message: {
      Subject: {
        Data: `${createdBy.firstName} ${createdBy.lastName} has invited you to join ${orgName} on Plutomi!`, // TODO if firstName or lastName === "NO_LAST_NAME" or NO_LAST_NAME, change this message
      },
      Body: {
        Html: {
          Data: `<h4>You can accept their invite at this link: <a href="${process.env.NEXT_PUBLIC_WEBSITE_URL}/invites">${process.env.NEXT_PUBLIC_WEBSITE_URL}/invites</a></h4><p>If you believe this email was received in error, you can safely ignore it.</p>`,
        },
      },
    },
  };
  try {
    await SES.send(new SendEmailCommand(newEmail));
  } catch (error) {
    console.error(error);
    throw new Error(`Unable to send org invite - ${error}`);
  }
}
