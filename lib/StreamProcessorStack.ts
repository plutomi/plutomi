import * as dotenv from "dotenv";
import * as cdk from "@aws-cdk/core";
import * as dynamodb from "@aws-cdk/aws-dynamodb";
import * as lambda from "@aws-cdk/aws-lambda";
import { NodejsFunction } from "@aws-cdk/aws-lambda-nodejs";
import * as path from "path";
import * as sns from "@aws-cdk/aws-sns";
import * as sqs from "@aws-cdk/aws-sqs";
import { STREAM_EVENTS } from "../Config";
import * as subscriptions from "@aws-cdk/aws-sns-subscriptions";
import { DynamoEventSource } from "@aws-cdk/aws-lambda-event-sources";
const resultDotEnv = dotenv.config({
  path: __dirname + `../../.env.${process.env.NODE_ENV}`,
});

if (resultDotEnv.error) {
  throw resultDotEnv.error;
}

interface StreamProcessorStackProps extends cdk.StackProps {
  table: dynamodb.Table;
}
export default class StreamProcessorStack extends cdk.Stack {
  /**
   *
   * @param {cdk.Construct} scope
   * @param {string} id
   * @param {cdk.StackProps=} props
   */
  constructor(scope: cdk.App, id: string, props: StreamProcessorStackProps) {
    super(scope, id, props);

    // Create an SNS topic to fan-out / filter all table changes
    const streamProcessorTopic = new sns.Topic(this, "Topic", {
      displayName: "StreamProcessorTopic",
      topicName: "StreamProcessorTopic",
    });

    const streamProcessorFunction = new NodejsFunction(
      this,
      "StreamProcessorFunction",
      {
        memorySize: 256,
        timeout: cdk.Duration.seconds(5),
        runtime: lambda.Runtime.NODEJS_14_X,
        architecture: lambda.Architecture.ARM_64,
        description:
          "Processes table changes from DynamoDB streams and sends them to SNS",
        handler: "main",
        entry: path.join(__dirname, `/../functions/streamProcessor.ts`),
        environment: {
          STREAM_PROCESSOR_TOPIC_ARN: streamProcessorTopic.topicArn,
        },
      }
    );

    const dynamoStreams = new DynamoEventSource(props.table, {
      startingPosition: lambda.StartingPosition.LATEST,
      retryAttempts: 3,
      batchSize: 1, // TODO re-evaluate this amount
      // TODO DLQ
    });
    // Subscribe our lambda to the stream
    streamProcessorFunction.addEventSource(dynamoStreams);

    // Allow lambda to publish into our SNS topic
    streamProcessorTopic.grantPublish(streamProcessorFunction);

    // TODO test queue, extract to its own stack with another lambda process

    const processorQueue = new sqs.Queue(this, "TEST Queue", {
      queueName: "TestQueue",
    });

    // TODO test, just making sure events reach the queue
    streamProcessorTopic.addSubscription(
      new subscriptions.SqsSubscription(processorQueue, {
        filterPolicy: {
          eventType: sns.SubscriptionFilter.stringFilter({
            allowlist: [STREAM_EVENTS.SEND_LOGIN_LINK],
          }),
        },
      })
    );
  }
}
