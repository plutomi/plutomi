import { SendEmailCommand, SendEmailCommandInput } from "@aws-sdk/client-ses";
import SES from "../../libs/sesClient";

export default async function SendOrgInvite({
  recipient_email,
  created_by,
  org_name,
}: SendOrgInviteInput) {
  const new_email: SendEmailCommandInput = {
    Source: `Plutomi <join@plutomi.com>`,
    Destination: {
      ToAddresses: [recipient_email.toLowerCase().trim()],
      CcAddresses: null,
      BccAddresses: null,
    },
    Message: {
      Subject: {
        Data: `${created_by.first_name} ${created_by.last_name} has invited you to join ${org_name} on Plutomi!`,
      },
      Body: {
        Html: {
          Data: `<h4>You can accept their invite at this link: <a href="${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/invites">${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/invites</a></h4><p>If you believe this email was received in error, you can safely ignore it.</p>`,
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
