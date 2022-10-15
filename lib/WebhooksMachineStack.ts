import * as cdk from 'aws-cdk-lib';
import * as sfn from 'aws-cdk-lib/aws-stepfunctions';
import * as tasks from 'aws-cdk-lib/aws-stepfunctions-tasks';
import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import { IntegrationPattern } from 'aws-cdk-lib/aws-stepfunctions';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { DYNAMO_TABLE_NAME } from '../Config';
import { ENVIRONMENT } from './AppStack';
import { env } from '../env';
import { getLambdaConfig } from '../utils/getLambdaConfig';

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
        ...getLambdaConfig({
          functionName: `${env.deploymentEnvironment}-${FUNCTION_NAME}`,
          functionDescription: 'Sends events to URL in the configured webhook',
          fileName: 'get-webhooks-and-send-event.ts',
          cascadingDeletion: false,
        }),
        environment: { ...ENVIRONMENT, DYNAMO_TABLE_NAME },
      },
    );

    const definition = new tasks.LambdaInvoke(this, 'GetWebhooksAndSendEventFunction', {
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
