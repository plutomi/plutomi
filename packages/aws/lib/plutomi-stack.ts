import * as cdk from "aws-cdk-lib";
import { Architecture, Runtime } from "aws-cdk-lib/aws-lambda";
import { SqsEventSource } from "aws-cdk-lib/aws-lambda-event-sources";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { RetentionDays } from "aws-cdk-lib/aws-logs";
import { TxtRecord } from "aws-cdk-lib/aws-route53";
import {
  ConfigurationSet,
  EventDestination,
  EmailIdentity,
  Identity,
} from "aws-cdk-lib/aws-ses";
import { Topic } from "aws-cdk-lib/aws-sns";
import { SqsSubscription } from "aws-cdk-lib/aws-sns-subscriptions";
import { Queue } from "aws-cdk-lib/aws-sqs";
import { Construct } from "constructs";
import * as path from "path";

const sesEventsTopicName = "ses-events-topic";
const sesEventsQueueName = "ses-events-queue";
const configurationSetEventDestinationName = "ses-event-destination";
const sesEventsProcessorFunctionName = "ses-events-processor";
const sesEmailIdentityName = `development-SES-Identity`;
const configurationSetName = `ses-configuration-set`;

export class PlutomiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const sesEventsTopic = new Topic(this, sesEventsTopicName, {
      displayName: "SES Events Topic",
      topicName: sesEventsTopicName,
    });

    const sesEventsQueue = new Queue(this, sesEventsQueueName, {
      queueName: sesEventsQueueName,
      retentionPeriod: cdk.Duration.days(14),
      receiveMessageWaitTime: cdk.Duration.seconds(20),
    });

    sesEventsTopic.addSubscription(new SqsSubscription(sesEventsQueue));

    /**
     * We need this config set so we can capture events like bounces, complaints, etc.
     * We separate them by subdomain so if we need to shut down one part of our email infrastructure,
     * we can do so without affecting the other parts.
     */
    const configurationSet = new ConfigurationSet(this, configurationSetName, {
      configurationSetName,
    });

    // Send events to our topic
    configurationSet.addEventDestination(configurationSetEventDestinationName, {
      configurationSetEventDestinationName,
      destination: EventDestination.snsTopic(sesEventsTopic),
    });

    // Create the SES identity
    void new EmailIdentity(this, sesEmailIdentityName, {
      identity: Identity.domain(`development.plutomi.com`),
      configurationSet,
      mailFromDomain: `notifications.development.plutomi.com`,
    });

    const eventProcessor = new NodejsFunction(
      this,
      sesEventsProcessorFunctionName,
      {
        functionName: sesEventsProcessorFunctionName,
        runtime: Runtime.NODEJS_LATEST,
        entry: path.join(__dirname, "../functions/sesEventProcessor.ts"),
        logRetention: RetentionDays.ONE_WEEK,
        memorySize: 128,
        timeout: cdk.Duration.seconds(30),
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
  }
}
