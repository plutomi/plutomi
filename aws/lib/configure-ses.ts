import { Stack } from "aws-cdk-lib";
import {
  ConfigurationSet,
  EventDestination,
  EmailIdentity,
  Identity,
} from "aws-cdk-lib/aws-ses";
import { env } from "../utils/env";
import { Topic } from "aws-cdk-lib/aws-sns";
import { SqsSubscription } from "aws-cdk-lib/aws-sns-subscriptions";
import { Queue } from "aws-cdk-lib/aws-sqs";

const sesEventsTopicName = "ses-events-topic";
const configurationSetEventDestinationName = "ses-event-destination";
const configurationSetName = `ses-configuration-set`;

type ConfigureEmailsProps = {
  stack: Stack;
  eventsQueue: Queue;
};

const sesEmailIdentityName = `ses-identity`;

export const configureSES = ({ stack, eventsQueue }: ConfigureEmailsProps) => {
  // Strips out https:// and any trailing slashes
  const rawUrl = new URL(env.BASE_WEB_URL).hostname;
  const identity = Identity.domain(rawUrl);

  // This is required by SES
  const configurationSet = new ConfigurationSet(stack, configurationSetName, {
    configurationSetName,
  });

  /**
   * notifications.plutomi.com for production OR
   * notifications-staging.plutomi.com etc.
   */
  const mailFromDomain = `${env.MAIL_FROM_SUBDOMAIN}.${rawUrl}`;

  // Create the SES identity
  void new EmailIdentity(stack, sesEmailIdentityName, {
    identity,
    configurationSet,
    mailFromDomain,
  });

  // SNS Topic for all events, they have to go through here before SQS :(
  const sesEventsTopic = new Topic(stack, sesEventsTopicName, {
    displayName: sesEventsTopicName,
    topicName: sesEventsTopicName,
  });

  // Configure SES to send events to our topic
  configurationSet.addEventDestination(configurationSetEventDestinationName, {
    configurationSetEventDestinationName,
    destination: EventDestination.snsTopic(sesEventsTopic),
  });

  // Send our SES events to our events queue
  sesEventsTopic.addSubscription(new SqsSubscription(eventsQueue));
};
