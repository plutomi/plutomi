import { SES } from '../../awsClients/sesClient';
import { SendEmailCommand } from '@aws-sdk/client-ses';
import { EMAILS } from '../../Config';

interface SendEmailProps {
  to: `${string}@${string}.${string}`;
  /**
   * Plutomi <admin@plutomi.com>
   * Header: Plutomi
   * Email: Is the actual email it comes from
   */
  source: {
    header: string;
    email: typeof EMAILS;
  };
  subject: string;
  body: string;
}
export const sendEmail = async ({ to, source, subject, body }: SendEmailProps) => {
  await SES.send(
    new SendEmailCommand({
      Destination: {
        ToAddresses: [to],
      },
      Source: `${source.header} <${source.email}`,
      Message: {
        Subject: {
          Data: subject,
        },
        Body: {
          Html: {
            Data: body,
          },
        },
      },
    }),
  );
};
