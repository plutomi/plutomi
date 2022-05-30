import * as dotenv from 'dotenv';
import * as cdk from '@aws-cdk/core';
import * as sfn from '@aws-cdk/aws-stepfunctions';
import * as tasks from '@aws-cdk/aws-stepfunctions-tasks';
import { LogGroup, RetentionDays } from '@aws-cdk/aws-logs';
import { Table } from '@aws-cdk/aws-dynamodb';
import { Choice, IntegrationPattern } from '@aws-cdk/aws-stepfunctions';
import { NodejsFunction } from '@aws-cdk/aws-lambda-nodejs';
import { Architecture, Runtime } from '@aws-cdk/aws-lambda';
import path from 'path';
import { ENTITY_TYPES, DYNAMO_TABLE_NAME } from '../Config';

const resultDotEnv = dotenv.config({
  path: `${process.cwd()}/.env.${process.env.NODE_ENV}`,
});

if (resultDotEnv.error) {
  throw resultDotEnv.error;
}

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

    const DYNAMO_QUERY_SETTINGS = {
      service: 'dynamodb',
      action: 'query',
      iamResources: [
        props.table.tableArn,
        `${props.table.tableArn}/index/GSI1`,
        `${props.table.tableArn}/index/GSI2`,
      ],
    };

    const ORG_HAS_WEBHOOKS = sfn.Condition.numberGreaterThan('$.detail.OldImage.totalWebhooks', 0);
    const SUCCESS = new sfn.Succeed(this, 'No webhooks in org :)');

    const GetWebhooksAndSendEventFunction = new NodejsFunction(
      this,
      `${process.env.NODE_ENV}-get-webhooks-and-send-event-function`,
      {
        functionName: `${process.env.NODE_ENV}-get-webhooks-and-send-event-function`,
        timeout: cdk.Duration.seconds(5),
        memorySize: 256,
        logRetention: RetentionDays.ONE_WEEK,
        runtime: Runtime.NODEJS_14_X,
        architecture: Architecture.ARM_64,
        environment: {
          NODE_ENV: process.env.NODE_ENV,
          DYNAMO_TABLE_NAME,
        },
        bundling: {
          minify: true,
          externalModules: ['aws-sdk'],
        },
        handler: 'main',
        description: 'Sends events to URL in the configured webhook',
        entry: path.join(__dirname, `/../functions/remove-deleted-question-from-stage.ts`),
      },
    );

    const definition = new Choice(this, 'Org Has Webhooks?')
      .when(
        ORG_HAS_WEBHOOKS,
        new tasks.LambdaInvoke(this, 'GetWebhooksAndSendEventFunction', {
          // payload: sfn.TaskInput.fromObject({
          //   stage: sfn.JsonPath.stringAt('$.stage.Item'),
          //   questionId: sfn.JsonPath.stringAt('$.questionId'),
          // }),
          lambdaFunction: GetWebhooksAndSendEventFunction,
          integrationPattern: IntegrationPattern.REQUEST_RESPONSE,
        }),
      )
      .otherwise(SUCCESS);

    // ----- State Machine Settings -----
    const log = new LogGroup(this, `${process.env.NODE_ENV}-WebhooksMachineLogGroup`, {
      retention: RetentionDays.ONE_MONTH,
    });

    this.WebhooksMachine = new sfn.StateMachine(this, 'WebhooksMachine', {
      stateMachineName: `${process.env.NODE_ENV}-WebhooksMachine`,
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
  }
}
