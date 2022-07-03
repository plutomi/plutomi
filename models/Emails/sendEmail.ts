import { SES } from '../../awsClients/sesClient';
import { SendEmailCommand } from '@aws-sdk/client-ses';
import { Emails } from '../../Config';

export type emailFormat = `${string}@${string}.${string}`;
export interface SendEmailProps {
  to: emailFormat;
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
export const sendEmail = async ({ to, from, subject, body }: SendEmailProps) => {
  await SES.send(
    new SendEmailCommand({
      Destination: {
        ToAddresses: [to],
      },
      Source: `${from.header} <${from.email}`,
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
