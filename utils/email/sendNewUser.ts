import { SendEmailCommand, SendEmailCommandInput } from "@aws-sdk/client-ses";
import SES from "../../awsClients/sesClient";

export default async function SendNewUserEmail(newUser: DynamoUser) {
  const newEmail: SendEmailCommandInput = {
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
          Data: `<h1>Email: ${newUser.userEmail}</h1><h1>ID: ${newUser.userId}</h1>`,
        },
      },
    },
  };
  try {
    await SES.send(new SendEmailCommand(newEmail));
  } catch (error) {
    console.error(error);
    throw new Error(`Unable to send new user email - ${error}`);
  }
}
