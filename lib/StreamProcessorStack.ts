import * as path from 'path';
import * as cdk from 'aws-cdk-lib';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import { EventBus } from 'aws-cdk-lib/aws-events';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { DynamoEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import { StartingPosition, Runtime, Architecture } from 'aws-cdk-lib/aws-lambda';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';
import { ENVIRONMENT } from './AppStack';
import { env } from '../env';
import { getLambdaConfig } from '../utils/getLambdaConfig';

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
      `${env.deploymentEnvironment}-${FUNCTION_NAME}`,
      {
        ...getLambdaConfig({
          functionName: `${env.deploymentEnvironment}-${FUNCTION_NAME}`,
          functionDescription:
            'Processes table changes from DynamoDB streams and sends them to EventBridge',
          fileName: 'stream-processor.ts',
          cascadingDeletion: false,
        }),
        environment: { ...ENVIRONMENT },
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
      `${env.deploymentEnvironment}-EventBus`,
      `${env.deploymentEnvironment}-EventBus`,
    );

    bus.grantPutEventsTo(this.StreamProcessorFunction);
  }
}
