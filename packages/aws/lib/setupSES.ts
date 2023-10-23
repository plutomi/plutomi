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
import { Topic } from "aws-cdk-lib/aws-sns";
import { SqsSubscription } from "aws-cdk-lib/aws-sns-subscriptions";
import { Queue } from "aws-cdk-lib/aws-sqs";
import * as path from "path";

type SetupSESProps = {
  stack: Stack;
  deploymentEnvironment: string;
};

const sesEventsTopicName = "ses-events-topic";
const configurationSetEventDestinationName = "ses-event-destination";
const sesEventsProcessorFunctionName = "ses-events-processor";
const sesEmailIdentityName = `development-SES-Identity`;
const configurationSetName = `ses-configuration-set`;
const sesEventsQueueName = `ses-events-queue`;

export const setupSES = ({ stack, deploymentEnvironment }: SetupSESProps) => {
  const sesEventsTopic = new Topic(stack, sesEventsTopicName, {
    displayName: sesEventsTopicName,
    topicName: sesEventsTopicName,
  });

  const sesEventsQueue = new Queue(stack, sesEventsQueueName, {
    queueName: sesEventsQueueName,
    retentionPeriod: Duration.days(14),
    receiveMessageWaitTime: Duration.seconds(20),
  });

  sesEventsTopic.addSubscription(new SqsSubscription(sesEventsQueue));

  /**
   * We need this config set so we can capture events like bounces, complaints, etc.
   * We separate them by subdomain so if we need to shut down one part of our email infrastructure,
   * we can do so without affecting the other parts.
   */
  const configurationSet = new ConfigurationSet(stack, configurationSetName, {
    configurationSetName,
  });

  // Send events to our topic
  configurationSet.addEventDestination(configurationSetEventDestinationName, {
    configurationSetEventDestinationName,
    destination: EventDestination.snsTopic(sesEventsTopic),
  });

  /**
   * plutomi.com for production OR
   * deploymentEnvironment.plutomi.com
   */
  const identityDomain = `${
    deploymentEnvironment === "production"
      ? "plutomi.com"
      : `${deploymentEnvironment}.plutomi.com`
  }`;

  /**
   * notifications.plutomi.com for production OR
   * notifications.deploymentEnvironment.plutomi.com
   */
  const mailFromDomain = `notifications.${
    deploymentEnvironment === "production" ? "" : `${deploymentEnvironment}.`
  }plutomi.com`;

  // Create the SES identity
  void new EmailIdentity(stack, sesEmailIdentityName, {
    identity: Identity.domain(identityDomain),
    configurationSet,
    mailFromDomain: mailFromDomain,
  });

  const eventProcessor = new NodejsFunction(
    // ! TODO: Switch to rust
    stack,
    sesEventsProcessorFunctionName,
    {
      functionName: sesEventsProcessorFunctionName,
      runtime: Runtime.NODEJS_LATEST,
      entry: path.join(__dirname, "../functions/sesEventProcessor.ts"),
      logRetention: RetentionDays.ONE_WEEK,
      memorySize: 128,
      timeout: Duration.seconds(30),
      architecture: Architecture.ARM_64,
      description: "Processes SES events.",
    }
  );

  eventProcessor.addEventSource(
    new SqsEventSource(sesEventsQueue, {
      batchSize: 1,
    })
  );

  // ! TODO: Add this manually
  // void new TxtRecord(this, "SES-Txt-Record-DMARC", {
  //   recordName: "_dmarc",
  //   zone: hostedZone,
  //   values: ["v=DMARC1", "p=none"],
  //   comment:
  //     "This _dmarc record indicates to your recipients that you properly set up DKIM, and that they are allowed to refuse your email if there is an authentication failure.",
  // });
};
