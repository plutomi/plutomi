import { SES } from '../../awsClients/sesClient';
import { SendEmailCommand } from '@aws-sdk/client-ses';
import { Emails } from '../../Config';

export interface SendEmailProps {
  to: string;
  /**
   * Plutomi <admin@plutomi.com>
   * Header: Plutomi
   * Email: Is the actual email it comes from
   */
  from: {
    header: string;
    email: Emails;
  };
  subject: string;
  body: string;
}

// TODO throw error if email format is wrong
export const sendEmail = async ({ to, from, subject, body }: SendEmailProps) => {
  await SES.send(
    new SendEmailCommand({
      Destination: {
        ToAddresses: [to.toLowerCase().trim()],
      },
      Source: `${from.header} <${from.email.toLowerCase().trim()}>`,
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
