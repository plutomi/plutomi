import type { Stack } from "aws-cdk-lib";
import type { IHostedZone } from "aws-cdk-lib/aws-route53";
import {
  ConfigurationSet,
  ConfigurationSetEventDestination,
  EmailIdentity,
  EventDestination,
  Identity
} from "aws-cdk-lib/aws-ses";
import { Topic } from "aws-cdk-lib/aws-sns";
import { env } from "./env";

enum EmailSubdomains {
  // Totp codes
  Notifications = "notifications"
  // TODO: Add billing, marketing, etc.
}

type CreateSesConfigProps = {
  stack: Stack;
  hostedZone: IHostedZone;
};

/**
 *
 * Sets up Email from SES with the proper subdomains.
 */
export const createSesConfig = ({
  stack,
  hostedZone
}: CreateSesConfigProps) => {
  /**
   * All events go to one SNS topic which sends them to SQS,
   * which is processed by lambda.
   */

  const sesEventsTopic = new Topic(stack, "SES-Events-Topic", {
    displayName: "SES Events Topic",
    topicName: "SES-Events-Topic"
  });

  Object.keys(EmailSubdomains).forEach((subdomain) => {
    /**
     * We need this config set so we can capture events like bounces, complaints, etc.
     * We separate them by subdomain so if we need to shut down one part of our infrastructure,
     * we can do so without affecting the other parts.
     */
    const configurationSetName = `${subdomain}-SES-ConfigurationSet`;
    const configurationSet = new ConfigurationSet(stack, configurationSetName, {
      configurationSetName,
      // TODO: Maybe change this in the future
      // Declaring this now so it is easier to find
      dedicatedIpPool: undefined
    });

    // Create the SES identity (this will automatically update Route53 records)
    void new EmailIdentity(stack, `${subdomain}-SES-Identity`, {
      identity: Identity.publicHostedZone(hostedZone),
      configurationSet,
      mailFromDomain: `${EmailSubdomains.Notifications}.${
        new URL(env.NEXT_PUBLIC_BASE_URL).hostname
      }`
    });

    // Send events to our SNS topic
    void new ConfigurationSetEventDestination(
      stack,
      `${configurationSetName}-Destination`,
      {
        configurationSet,
        destination: EventDestination.snsTopic(sesEventsTopic)
      }
    );
  });
};
