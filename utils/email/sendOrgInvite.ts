import { SendEmailCommand, SendEmailCommandInput } from "@aws-sdk/client-ses";
import SES from "../../libs/sesClient";

export default async function SendOrgInvite({
  recipient,
  invited_by,
  org_name,
}: SendOrgInviteInput) {
  const new_email: SendEmailCommandInput = {
    Source: `Plutomi <join@plutomi.com>`,
    Destination: {
      ToAddresses: [recipient],
      CcAddresses: null,
      BccAddresses: null,
    },
    Message: {
      Subject: {
        Data: `${invited_by.first_name} ${invited_by.last_name} has invited to join ${org_name} on Plutomi!`,
      },
      Body: {
        Html: {
          Data: `<h4>You can accept their invite at this link: <a href="https://plutomi.com/invites">https://plutomi.com/invites</a></h4><p>If you believe this email was received in error, you can safely ignore it.</p>`,
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
