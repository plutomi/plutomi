import * as cdk from 'aws-cdk-lib';
import * as sfn from 'aws-cdk-lib/aws-stepfunctions';
import * as tasks from 'aws-cdk-lib/aws-stepfunctions-tasks';
import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import { IntegrationPattern } from 'aws-cdk-lib/aws-stepfunctions';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Architecture, Runtime } from 'aws-cdk-lib/aws-lambda';
import path from 'path';
import { DYNAMO_TABLE_NAME } from '../Config';
import { ENVIRONMENT } from './AppStack';
import { env } from '../env';

interface WebhooksMachineProps extends cdk.StackProps {
  table: Table;
}

/**
 * Sends a POST event with applicant info on certain applicant events
 */
export default class WebhooksMachine extends cdk.Stack {
  public WebhooksMachine: sfn.StateMachine;
  /**
   * @param {cdk.Construct} scope
   * @param {string} id
   * @param {cdk.StackProps=} props
   */

  constructor(scope: cdk.App, id: string, props: WebhooksMachineProps) {
    super(scope, id, props);

    const FUNCTION_NAME = 'get-webhooks-and-send-event-function';
    const GetWebhooksAndSendEventFunction = new NodejsFunction(
      this,
      `${env.deploymentEnvironment}-${FUNCTION_NAME}`,
      {
        functionName: `${env.deploymentEnvironment}-${FUNCTION_NAME}`,
        timeout: cdk.Duration.seconds(5),
        memorySize: 256,
        logRetention: RetentionDays.ONE_WEEK,
        runtime: Runtime.NODEJS_16_X,
        architecture: Architecture.X86_64, // TODO fix deploy issues in actions
        environment: { ...ENVIRONMENT, DYNAMO_TABLE_NAME },
        bundling: {
          minify: true,
          externalModules: ['aws-sdk'],
        },
        handler: 'main',
        description: 'Sends events to URL in the configured webhook',
        entry: path.join(__dirname, `/../functions/get-webhooks-and-send-event.ts`),
      },
    );

    const definition = new tasks.LambdaInvoke(this, 'GetWebhooksAndSendEventFunction', {
      // payload: sfn.TaskInput.fromObject({
      //   stage: sfn.JsonPath.stringAt('$.stage.Item'),
      //   questionId: sfn.JsonPath.stringAt('$.questionId'),
      // }),
      lambdaFunction: GetWebhooksAndSendEventFunction,
      integrationPattern: IntegrationPattern.REQUEST_RESPONSE,
    }).addRetry({ maxAttempts: 2 });

    // ----- State Machine Settings -----
    const log = new LogGroup(this, `${env.deploymentEnvironment}-WebhooksMachineLogGroup`, {
      retention: RetentionDays.ONE_MONTH,
    });

    this.WebhooksMachine = new sfn.StateMachine(this, 'WebhooksMachine', {
      stateMachineName: `${env.deploymentEnvironment}-WebhooksMachine`,
      definition,
      timeout: cdk.Duration.minutes(5),
      stateMachineType: sfn.StateMachineType.EXPRESS,
      logs: {
        // Not enabled by default
        includeExecutionData: true,
        destination: log,
        level: sfn.LogLevel.ALL,
      },
    });

    props.table.grantWriteData(this.WebhooksMachine); // TODO this event should just be update. No need for extra permissions
    props.table.grantReadData(GetWebhooksAndSendEventFunction); // TODO too broad
  }
}
