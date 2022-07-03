import * as cdk from '@aws-cdk/core';
import * as sfn from '@aws-cdk/aws-stepfunctions';
import * as tasks from '@aws-cdk/aws-stepfunctions-tasks';
import { LogGroup, RetentionDays } from '@aws-cdk/aws-logs';
import { Table } from '@aws-cdk/aws-dynamodb';
import { Emails, Entities, DOMAIN_NAME, WEBSITE_URL } from '../Config';
import { NodejsFunction } from '@aws-cdk/aws-lambda-nodejs';
import { Architecture, Runtime } from '@aws-cdk/aws-lambda';
import path from 'path';
import { DYNAMO_TABLE_NAME } from '../Config';
import { IntegrationPattern } from '@aws-cdk/aws-stepfunctions';
import * as iam from '@aws-cdk/aws-iam';
interface CommsMachineProps extends cdk.StackProps {
  table: Table;
}

export default class CommsMachineStack extends cdk.Stack {
  public CommsMachine: sfn.StateMachine;
  /**
   * @param {cdk.Construct} scope
   * @param {string} id
   * @param {cdk.StackProps=} props
   */

  constructor(scope: cdk.App, id: string, props: CommsMachineProps) {
    super(scope, id, props);


    const FUNCTION_NAME = 'comms-machine-function';
    const commsMachineFunction = new NodejsFunction(
      this,
      `${process.env.NODE_ENV}-${FUNCTION_NAME}`,
      {
        functionName: `${process.env.NODE_ENV}-${FUNCTION_NAME}`,
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
        description: 'Sends emails to new users and admins',
        entry: path.join(__dirname, `/../functions/commsMachine.ts`),
      },
    );

    // Allows lambda to send emails with SES
    commsMachineFunction.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ['ses:SendEmail', 'ses:SendRawEmail', 'ses:SendTemplatedEmail'],
        resources: [`arn:aws:ses:${this.region}:${this.account}:identity/${DOMAIN_NAME}`],
      }),
    );

    const definition = new tasks.LambdaInvoke(this, 'SendComms', {
      lambdaFunction: commsMachineFunction,
    });

    const log = new LogGroup(this, `${process.env.NODE_ENV}-CommsMachineLogGroup`);

    this.CommsMachine = new sfn.StateMachine(this, 'CommsMachine', {
      stateMachineName: `${process.env.NODE_ENV}-CommsMachine`,
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
  }
}
