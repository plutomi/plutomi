import type { Email, PlutomiEmails } from "@plutomi/shared";
import { SendEmailCommand } from "@aws-sdk/client-ses";
import { SES } from "../../awsClients";

type SendEmailProps = {
  to: Email; // TODO: Allow arrays
  from: {
    header: string;
    email: Email | PlutomiEmails;
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
