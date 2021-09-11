import SES from "../../libs/sesClient";
import { SendEmailCommand, SendEmailCommandInput } from "@aws-sdk/client-ses";

export default async function SendOrgInvite({
  recipient,
  invited_by,
  org_id,
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
        Data: `${invited_by.full_name} has sent you an invite!`,
      },
      Body: {
        Html: {
          Data: `<h1>You can join their organization at this link: <a href="https://plutomi.com/${org_id}/join">https://plutomi.com/${org_id}/join</a></h1>`,
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
