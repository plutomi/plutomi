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

    // const setEmailToVerified = new tasks.DynamoUpdateItem(this, 'UpdateVerifiedEmailStatus', {
    //   key: {
    //     PK: tasks.DynamoAttributeValue.fromString(sfn.JsonPath.stringAt('$.PK')),
    //     SK: tasks.DynamoAttributeValue.fromString(Entities.USER),
    //   },
    //   table: props.table,
    //   updateExpression: 'SET verifiedEmail = :newValue',
    //   expressionAttributeValues: {
    //     ':newValue': tasks.DynamoAttributeValue.fromBoolean(true),
    //   },
    //   /**
    //    * If the value of ResultPath is null, that means that the state’s own raw output is discarded and its raw input becomes its result.
    //    * https://states-language.net/spec.html#filters
    //    * We want the original input to be passed down to the next tasks so that we can format emails
    //    */
    //   resultPath: sfn.JsonPath.DISCARD,
    // });

    // setEmailToVerified.addRetry({ maxAttempts: 2 });

    // const sendLoginLink = new tasks.CallAwsService(this, 'SendLoginLink', {
    //   // TODO update once native integration is implemented

    //   parameters: {
    //     Source: `Plutomi <${Emails.GENERAL}>`,
    //     Destination: {
    //       'ToAddresses.$': `States.Array($.detail.NewImage.user.email)`,
    //     },
    //     Message: {
    //       Subject: {
    //         Data: `Your magic login link is here!`,
    //       },
    //       Body: {
    //         Html: {
    //           // TODO add unsubscribe key
    //           'Data.$': `States.Format('<h1>Click <a href="{}" noreferrer target="_blank" >this link</a> to log in!</h1><p>It will expire {} so you better hurry.</p><p>If you did not request this link you can safely ignore it.',
    //           $.detail.NewImage.loginLinkUrl, $.detail.NewImage.relativeExpiry)`,
    //         },
    //       },
    //     },
    //   },
    // });
    // // TODO export this to its own file

    // const sendApplicationLink = new tasks.CallAwsService(this, 'SendApplicationLink', {
    //   // TODO update once native integration is implemented

    //   ...SES_SETTINGS,
    //   parameters: {
    //     Source: `Plutomi <${Emails.GENERAL}>`,
    //     Destination: {
    //       'ToAddresses.$': `States.Array($.detail.NewImage.email)`,
    //     },
    //     Message: {
    //       Subject: {
    //         Data: `Here is a link to your application!`,
    //       },
    //       Body: {
    //         Html: {
    //           // TODO add unsubscribe
    //           'Data.$': `States.Format('<h1><a href="${WEBSITE_URL}/{}/applicants/{}" rel=noreferrer target="_blank" >Click this link to view your application!</a></h1><p>If you did not request this link, you can safely ignore it.</p>',
    //             $.orgId, $.detail.NewImage.applicantId)`,
    //         },
    //       },
    //     },
    //   },
    // });

    // // TODO export this to its own file
    // const sendOrgInvite = new tasks.CallAwsService(this, 'SendOrgInvite', {
    //   // TODO update once native integration is implemented

    //   ...SES_SETTINGS,
    //   parameters: {
    //     Source: `Plutomi <${Emails.JOIN}>`,
    //     Destination: {
    //       'ToAddresses.$': `States.Array($.detail.NewImage.recipient.email)`,
    //     },
    //     Message: {
    //       Subject: {
    //         'Data.$': `States.Format('{} {} has invited you to join them on {}!',
    //         $.detail.NewImage.createdBy.firstName, $.detail.NewImage.createdBy.lastName, $.detail.NewImage.orgName)`,
    //       },
    //       Body: {
    //         Html: {
    //           // TODO add unsubscribe
    //           Data: `<h4>You can log in at <a href="${WEBSITE_URL}" target="_blank" rel=noreferrer>${WEBSITE_URL}</a> to accept their invite!</h4><p>If you believe this email was received in error, you can safely ignore it.</p>`,
    //         },
    //       },
    //     },
    //   },
    // });

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

    const definition = new tasks.LambdaInvoke(this, 'SendNewUserEmails', {
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
