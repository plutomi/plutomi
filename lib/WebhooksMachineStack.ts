import * as dotenv from 'dotenv';
import * as cdk from '@aws-cdk/core';
import * as sfn from '@aws-cdk/aws-stepfunctions';
import * as tasks from '@aws-cdk/aws-stepfunctions-tasks';
import { LogGroup, RetentionDays } from '@aws-cdk/aws-logs';
import { Table } from '@aws-cdk/aws-dynamodb';
// import { DYNAMO_TABLE_NAME, ENTITY_TYPES } from '../Config';
// import { Choice, IntegrationPattern } from '@aws-cdk/aws-stepfunctions';
// import { NodejsFunction } from '@aws-cdk/aws-lambda-nodejs';
// import { Architecture, Runtime } from '@aws-cdk/aws-lambda';
// import * as iam from '@aws-cdk/aws-iam';
// import path from 'path';

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

    const definition = new sfn.Succeed(this, 'Success :)');
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
