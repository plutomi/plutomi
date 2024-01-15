import { Stack, Duration } from "aws-cdk-lib";
import { Architecture, Code, Runtime } from "aws-cdk-lib/aws-lambda";
import { SqsEventSource } from "aws-cdk-lib/aws-lambda-event-sources";
import { Function } from "aws-cdk-lib/aws-lambda";
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
import { env } from "../utils/env";

type SetupSESProps = {
  stack: Stack;
};

const sesEventsTopicName = "ses-events-topic";
const configurationSetEventDestinationName = "ses-event-destination";
const sesEventsProcessorFunctionName = "ses-events-consumer";
const sesEmailIdentityName = `ses-identity`;
const configurationSetName = `ses-configuration-set`;
const sesEventsQueueName = `ses-events-queue`;

export const setupSES = ({ stack }: SetupSESProps) => {
  const sesEventsTopic = new Topic(stack, sesEventsTopicName, {
    displayName: sesEventsTopicName,
    topicName: sesEventsTopicName,
  });

  const sesEventsQueue = new Queue(stack, sesEventsQueueName, {
    queueName: sesEventsQueueName,
    retentionPeriod: Duration.days(14),
    visibilityTimeout: Duration.seconds(30),
    // Long polling
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

  // Strips out https:// and any trailing slashes
  const rawUrl = new URL(env.NEXT_PUBLIC_BASE_URL).hostname;
  const identity = Identity.domain(rawUrl);

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

  const sesEventConsumerFunction = new Function(
    stack,
    sesEventsProcessorFunctionName,
    {
      runtime: Runtime.PROVIDED_AL2,
      handler: "main",
      functionName: sesEventsProcessorFunctionName,
      memorySize: 128,
      logRetention: RetentionDays.ONE_WEEK,
      // This needs to be higher than maxConcurrency in the event source
      // Temporarily disabled because  it causes an issue when trying to deploy to staging and dev environments because our account concurrency is so low :/=
      //  reservedConcurrentExecutions: 3,
      timeout: Duration.seconds(30),
      architecture: Architecture.ARM_64,
      description: "Processes SES events.",
      environment: {
        QUEUE_URL: sesEventsQueue.queueUrl,
        ...env,
      },
      code: Code.fromAsset(
        path.join(
          __dirname,
          "../../../packages/consumers/ses-events/target/lambda/ses-events/Bootstrap.zip"
        )
      ),
    }
  );

  sesEventConsumerFunction.addEventSource(
    new SqsEventSource(sesEventsQueue, {
      // TODO: https://docs.aws.amazon.com/lambda/latest/dg/with-sqs.html#services-sqs-batchfailurereporting
      // Implement batch processing AND partial failures
      // https://docs.aws.amazon.com/lambda/latest/dg/with-sqs.html event.Records
      batchSize: 100,
      maxBatchingWindow: Duration.minutes(1),
      maxConcurrency: 2,
      reportBatchItemFailures: true,
    })
  );
};
