import * as dotenv from "dotenv";
import * as dynamodb from "@aws-cdk/aws-dynamodb";
import * as lambda from "@aws-cdk/aws-lambda";
import * as path from "path";
import * as sns from "@aws-cdk/aws-sns";
import * as lambdaEventSources from "@aws-cdk/aws-lambda-event-sources";
import { NodejsFunction } from "@aws-cdk/aws-lambda-nodejs";
import * as cdk from "@aws-cdk/core";
import * as events from "@aws-cdk/aws-events";
import * as targets from "@aws-cdk/aws-events-targets";
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
  public readonly StreamProcessorTopic: sns.Topic;

  /**
   *
   * @param {cdk.Construct} scope
   * @param {string} id
   * @param {cdk.StackProps=} props
   */
  constructor(scope: cdk.App, id: string, props: StreamProcessorStackProps) {
    super(scope, id, props);

    // Create the SNS topic
    this.StreamProcessorTopic = new sns.Topic(this, "Topic", {
      displayName: "StreamProcessorTopic",
      topicName: "StreamProcessorTopic",
    });

    const streamProcessorFunction = new NodejsFunction(
      this,
      "StreamProcessorFunction",
      {
        memorySize: 128,
        timeout: cdk.Duration.seconds(5),
        runtime: lambda.Runtime.NODEJS_14_X,
        architecture: lambda.Architecture.ARM_64,
        bundling: {
          minify: true,
          externalModules: ["aws-sdk"],
        },
        handler: "main",
        description:
          "Processes table changes from DynamoDB streams and sends them to SNS",
        entry: path.join(__dirname, `/../functions/streamProcessor.ts`),
        environment: {
          STREAM_PROCESSOR_TOPIC_ARN: this.StreamProcessorTopic.topicArn,
        },
      }
    );

    const dynamoStreams = new lambdaEventSources.DynamoEventSource(
      props.table,
      {
        startingPosition: lambda.StartingPosition.LATEST,
        retryAttempts: 3,
        batchSize: 1, // TODO re-evaluate this amount
        // TODO DLQ
      }
    );
    // Subscribe our lambda to the stream
    streamProcessorFunction.addEventSource(dynamoStreams);

    // Allow lambda to publish into our SNS topic
    this.StreamProcessorTopic.grantPublish(streamProcessorFunction);
  }
}
