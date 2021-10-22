import { SendEmailCommand, SendEmailCommandInput } from "@aws-sdk/client-ses";
import SES from "../../libs/sesClient";

export default async function SendApplicantLink({
  org_id,
  org_name,
  applicant_id,
  applicant_email,
}: SendApplicantLinkInput) {
<<<<<<< HEAD
  const application_link = `${process.env.PLUTOMI_URL}/${org_id}/applicants/${applicant_id}`;
=======
  const application_link = `${process.env.PLUTOMI_URL}/${
    org_id as string
  }/applicants/${applicant_id as string}`;
>>>>>>> 73b8a24 (fixed wrong callback url on signin)
  const new_email: SendEmailCommandInput = {
    Source: `${org_name} <applications@plutomi.com>`,
    Destination: {
      ToAddresses: [applicant_email.toLowerCase()],
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
