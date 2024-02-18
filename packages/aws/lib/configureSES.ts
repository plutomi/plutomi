import { Stack, Duration } from "aws-cdk-lib";
import { Architecture, Runtime } from "aws-cdk-lib/aws-lambda";
import { SqsEventSource } from "aws-cdk-lib/aws-lambda-event-sources";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { RetentionDays } from "aws-cdk-lib/aws-logs";
import {
  ConfigurationSet,
  EventDestination,
  EmailIdentity,
  Identity,
} from "aws-cdk-lib/aws-ses";

import { env } from "../utils/env";
import { Topic } from "aws-cdk-lib/aws-sns";
import { SqsSubscription } from "aws-cdk-lib/aws-sns-subscriptions";

const sesEventsTopicName = "ses-events-topic";
const configurationSetEventDestinationName = "ses-event-destination";
const configurationSetName = `ses-configuration-set`;
const sesEventsQueueName = `ses-events-queue`;

type ConfigureEmailsProps = {
  stack: Stack;
  // ! TODO: PASS A QUEUE  IN
};

const sesEmailIdentityName = `ses-identity`;

export const configureSES = ({ stack }: ConfigureEmailsProps) => {
  // Strips out https:// and any trailing slashes
  const rawUrl = new URL(env.NEXT_PUBLIC_BASE_URL).hostname;
  const identity = Identity.domain(rawUrl);

  // This is required by SES
  const configurationSet = new ConfigurationSet(stack, configurationSetName, {
    configurationSetName,
  });

  /**
   * notifications.plutomi.com for production OR
   * notifications.deploymentEnvironment.plutomi.com
   */
  const mailFromDomain = `notifications.${rawUrl}`;

  // Create the SES identity
  void new EmailIdentity(stack, sesEmailIdentityName, {
    identity,
    configurationSet,
    mailFromDomain,
  });

  // SNS Topic for all events, they have to go through here :(
  const sesEventsTopic = new Topic(stack, sesEventsTopicName, {
    displayName: sesEventsTopicName,
    topicName: sesEventsTopicName,
  });

  // ! TODO: PASS THIS IN
  // Queue for our lambda function to consume
  const sesEventsQueue = new Queue(stack, sesEventsQueueName, {
    queueName: sesEventsQueueName,
    retentionPeriod: Duration.days(14),
    visibilityTimeout: Duration.seconds(30),
    // Long polling
    receiveMessageWaitTime: Duration.seconds(20),
  });

  sesEventsTopic.addSubscription(new SqsSubscription(sesEventsQueue));

  // Configure SES to send events to our topic
  configurationSet.addEventDestination(configurationSetEventDestinationName, {
    configurationSetEventDestinationName,
    destination: EventDestination.snsTopic(sesEventsTopic),
  });
};
