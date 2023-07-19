import { Duration, type Stack } from "aws-cdk-lib";
import { TxtRecord, type IHostedZone } from "aws-cdk-lib/aws-route53";
import {
  ConfigurationSet,
  EmailIdentity,
  EventDestination,
  Identity
} from "aws-cdk-lib/aws-ses";
import { Topic } from "aws-cdk-lib/aws-sns";
import { Queue } from "aws-cdk-lib/aws-sqs";
import { SqsSubscription } from "aws-cdk-lib/aws-sns-subscriptions";
import { env } from "./env";

enum EmailSubdomains {
  // Totp codes
  Notifications = "notifications"
  // TODO: Add billing, marketing, etc.

  // Do not use 
}

type CreateSesConfigProps = {
  stack: Stack;
  hostedZone: IHostedZone;
};

/**
 *
 * Sets up Email from SES with the proper subdomains.
 * You can read more about this setup here:
 * https://dev.to/kumo/from-zero-to-hero-send-aws-ses-emails-like-a-pro-4nei#2-make-sure-you-dont-end-up-in-your-users-spams
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

  const sesEventsQueue = new Queue(stack, "SES-Events-Queue", {
    queueName: "SES-Events-Queue",
    retentionPeriod: Duration.days(14),
    receiveMessageWaitTime: Duration.seconds(20)
  });

  sesEventsTopic.addSubscription(new SqsSubscription(sesEventsQueue));

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

    // Send events to our topic
    configurationSet.addEventDestination("EventDestination", {
      destination: EventDestination.snsTopic(sesEventsTopic)
    });

    // Create the SES identity (this will automatically update Route53 records)
    const emailIdentityName = `${subdomain}-SES-Identity`;
    void new EmailIdentity(stack, emailIdentityName, {
      identity: Identity.publicHostedZone(hostedZone),
      configurationSet,
      mailFromDomain: `${EmailSubdomains.Notifications}.${
        new URL(env.NEXT_PUBLIC_BASE_URL).hostname
      }`
    });
  });

  void new TxtRecord(stack, "SES-Txt-Record", {
    recordName: "_dmarc",
    zone: hostedZone,
    values: ["v=DMARC1", "p=none"],
    comment:
      "This _dmarc record indicates to your recipients that you properly set up DKIM, and that they are allowed to refuse your email if there is an authentication failure."
  });
};
