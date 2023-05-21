import type { Email, PlutomiEmails } from "@plutomi/shared";
import { SendEmailCommand } from "@aws-sdk/client-ses";
import { render } from "@react-email/render";
import { SES } from "../../awsClients";

type SendEmailProps = {
  to: Email; // TODO: Allow arrays
  from: {
    header: string;
    email: Email | PlutomiEmails;
  };
  subject: string;
  bodyJsx: JSX.Element;
};

export const sendEmail = async ({
  to,
  from,
  subject,
  bodyJsx
}: SendEmailProps) => {
  const html = render(bodyJsx);

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
            Data: html
          }
        }
      }
    })
  );
};
