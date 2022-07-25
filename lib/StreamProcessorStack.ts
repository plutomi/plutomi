import * as path from 'path';
import * as cdk from 'aws-cdk-lib';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import { EventBus } from 'aws-cdk-lib/aws-events';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { DynamoEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import { StartingPosition, Runtime, Architecture } from 'aws-cdk-lib/aws-lambda';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';

interface StreamProcessorStackProps extends cdk.StackProps {
  table: Table;
}
export default class StreamProcessorStack extends cdk.Stack {
  StreamProcessorFunction: NodejsFunction;
  /**
   * @param {cdk.Construct} scope
   * @param {string} id
   * @param {cdk.StackProps=} props
   */

  constructor(scope: cdk.App, id: string, props: StreamProcessorStackProps) {
    super(scope, id, props);
    const FUNCTION_NAME = 'stream-processor-function';
    this.StreamProcessorFunction = new NodejsFunction(
      this,
      `${process.env.NODE_ENV}-${FUNCTION_NAME}`,
      {
        functionName: `${process.env.NODE_ENV}-${FUNCTION_NAME}`,
        environment: {
          NODE_ENV: process.env.NODE_ENV, // To get the dynamic event bus name // TODO this is silly
        },
        timeout: cdk.Duration.seconds(5),
        memorySize: 256,
        logRetention: RetentionDays.ONE_WEEK,
        runtime: Runtime.NODEJS_14_X,
        architecture: Architecture.ARM_64,
        bundling: {
          minify: true,
          externalModules: ['aws-sdk'],
        },
        handler: 'main',
        description: 'Processes table changes from DynamoDB streams and sends them to EventBridge',
        entry: path.join(__dirname, `/../functions/stream-processor.ts`),
      },
    );

    const dynamoStreams = new DynamoEventSource(props.table, {
      startingPosition: StartingPosition.LATEST,
      retryAttempts: 3,
      batchSize: 1, // TODO re-evaluate this amount
      // TODO DLQ
    });
    // Subscribe our lambda to the stream
    this.StreamProcessorFunction.addEventSource(dynamoStreams);

    // Give our lambda acccess to the push events into EB
    const bus = EventBus.fromEventBusName(
      this,
      `${process.env.NODE_ENV}-EventBus`,
      `${process.env.NODE_ENV}-EventBus`,
    );

    bus.grantPutEventsTo(this.StreamProcessorFunction);
  }
}
