import { SendEmailCommand, SendEmailCommandInput } from "@aws-sdk/client-ses";
import SES from "../../awsClients/sesClient";

export default async function SendApplicantLink({
  orgId,
  org_name,
  applicantId,
  applicant_email,
}) {
  const application_link = `${process.env.NEXT_PUBLIC_WEBSITE_URL}/${orgId}/applicants/${applicantId}`;
  const new_email: SendEmailCommandInput = {
    Source: `${org_name} <applications@plutomi.com>`,
    Destination: {
      ToAddresses: [applicant_email],
      CcAddresses: null,
      BccAddresses: null,
    },
    Message: {
      Subject: {
        Data: `Here is a link to your application!`,
      },
      Body: {
        Html: {
          Data: `<h1><a href="${application_link}" noreferrer target="_blank" >Click this link to view your application!</a></h1><p>If you did not request this link, you can safely ignore it.</p>`,
        },
      },
    },
  };
  try {
    await SES.send(new SendEmailCommand(new_email));
  } catch (error) {
    console.error(error);
    throw new Error(`Unable to send applicant link - ${error}`);
  }
}
