import { SendEmailCommand, SendEmailCommandInput } from "@aws-sdk/client-ses";
import SES from "../../lib/awsClients/sesClient";

export default async function SendNewUserEmail(new_user: DynamoUser) {
  const new_email: SendEmailCommandInput = {
    Source: `Plutomi <newuser@plutomi.com>`,
    Destination: {
      ToAddresses: ["contact@plutomi.com"],
      CcAddresses: null,
      BccAddresses: null,
    },
    Message: {
      Subject: {
        Data: `New user has signed up!`,
      },
      Body: {
        Html: {
          Data: `<h1>Email: ${new_user.user_email}</h1><h1>ID: ${new_user.user_id}</h1>`,
        },
      },
    },
  };
  try {
    await SES.send(new SendEmailCommand(new_email));
  } catch (error) {
    console.error(error);
    throw new Error(`Unable to send new user email - ${error}`);
  }
}
