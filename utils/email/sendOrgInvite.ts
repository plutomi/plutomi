import { SendEmailCommand, SendEmailCommandInput } from "@aws-sdk/client-ses";
import SES from "../../lib/awsClients/sesClient";

export default async function SendOrgInvite({
  recipientEmail,
  createdBy,
  org_name,
}: SendOrgInviteInput) {
  const new_email: SendEmailCommandInput = {
    Source: `Plutomi <join@plutomi.com>`,
    Destination: {
      ToAddresses: [recipientEmail.toLowerCase().trim()],
      CcAddresses: null,
      BccAddresses: null,
    },
    Message: {
      Subject: {
        Data: `${createdBy.firstName} ${createdBy.lastName} has invited you to join ${org_name} on Plutomi!`, // TODO if firstName or lastName === "NO_firstName" or NO_lastName, change this message
      },
      Body: {
        Html: {
          Data: `<h4>You can accept their invite at this link: <a href="${process.env.WEBSITE_URL}/invites">${process.env.WEBSITE_URL}/invites</a></h4><p>If you believe this email was received in error, you can safely ignore it.</p>`,
        },
      },
    },
  };
  try {
    await SES.send(new SendEmailCommand(new_email));
  } catch (error) {
    console.error(error);
    throw new Error(`Unable to send org invite - ${error}`);
  }
}
