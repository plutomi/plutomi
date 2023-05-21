import type { Email, PlutomiEmails } from "@plutomi/shared";

type SendEmailProps = {
  to: Email; // TODO: Allow arrays
  from: {
    header: string;
    email: Email | PlutomiEmails;
  };
  subject: string;
  body: string;
};

export const sendEmail = async ({
  to,
  from,
  subject,
  body
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
            Data: body
          }
        }
      }
    })
  );
};
