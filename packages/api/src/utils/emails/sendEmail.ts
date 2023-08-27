import type { PlutomiEmails } from "@plutomi/shared";
import { SendEmailCommand } from "@aws-sdk/client-ses";
import { SES } from "../../awsClients";

type SendEmailProps = {
  to: string; // TODO: Allow arrays
  from: {
    header: string;
    email: string | PlutomiEmails;
  };
  subject: string;
  bodyHtml: string;
};

export const sendEmail = async ({
  to,
  from,
  subject,
  bodyHtml
}: SendEmailProps) => {
  await SES.send(
    new SendEmailCommand({
      Destination: {
        ToAddresses: [to]
      },
      Source: `${from.header} <${from.email}>`,
      Message: {
        Subject: {
          Data: subject
        },
        Body: {
          Html: {
            Data: bodyHtml
          }
        }
      }
    })
  );
};
