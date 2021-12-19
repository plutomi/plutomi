import * as dotenv from "dotenv";
import * as dynamodb from "@aws-cdk/aws-dynamodb";
import * as path from "path";
import * as cdk from "@aws-cdk/core";
import * as sqs from "@aws-cdk/aws-sqs";
import * as lambda from "@aws-cdk/aws-lambda";
import * as lambdaEventSources from "@aws-cdk/aws-lambda-event-sources";
import { NodejsFunction } from "@aws-cdk/aws-lambda-nodejs";
import * as iam from "@aws-cdk/aws-iam";
import * as sns from "@aws-cdk/aws-sns";
import { STREAM_EVENTS } from "../Config";

const resultDotEnv = dotenv.config({
  path: __dirname + `../../.env.${process.env.NODE_ENV}`,
});

if (resultDotEnv.error) {
  throw resultDotEnv.error;
}

interface NewUserStackProps extends cdk.StackProps {
  table: dynamodb.Table;
}

/**
 * This stack has 4 main purposes:
 * 1. When a user *attempts* to log in, send them an email with their login link
 * 2. When a user logs in for the first time, set their `verifiedEmail` property to TRUE
 * 3. When a user logs in for the first time, send an email to the app admin letting them know
 * 4. When a user logs in for the first time, send that user a welcome email
 */
export default class NewUserStack extends cdk.Stack {
  /**
   * @param {cdk.Construct} scope
   * @param {string} id
   * @param {cdk.StackProps=} props
   */

  constructor(scope: cdk.App, id: string, props: NewUserStackProps) {
    super(scope, id, props);

    const AWS_ACCOUNT_ID: string = process.env.AWS_ACCOUNT_ID;
    const SES_DOMAIN = process.env.DOMAIN_NAME;
    const API_URL: string = process.env.API_URL;
    const DYNAMO_TABLE_NAME = process.env.DYNAMO_TABLE_NAME;
    const STACK = [
      {
        queue: {
          queueName: "SendLoginLinkQueue",
          desiredEvents: [STREAM_EVENTS.SEND_LOGIN_LINK],
          visibilityTimeout: cdk.Duration.seconds(10),
        },
        function: {
          name: "SendLoginLinkFunction",
          description:
            "Sends login links to users when they sign in with their email",
          entry: "sendLoginLink.ts", // Parent directory is the `functions`
          sendEmail: true,
          environment: {
            API_URL: API_URL,
          },
        },
      },
      {
        queue: {
          queueName: "NewUserAdminEmailQueue",
          desiredEvents: [STREAM_EVENTS.NEW_USER],
          visibilityTimeout: cdk.Duration.seconds(10),
        },
        function: {
          name: "NewUserAdminEmailFunction",
          description: "Sends an email to app admins whenever a user signs up",
          entry: "sendNewUserAdminEmail.ts", // Parent directory is the `functions`
          sendEmail: true,
        },
      },

      {
        queue: {
          queueName: "BEANSQUEUE",
        },
      },

      {
        queue: {
          queueName: "NewUserVerifiedEmailQueue",
          desiredEvents: [STREAM_EVENTS.NEW_USER],
          visibilityTimeout: cdk.Duration.seconds(10),
        },
        function: {
          name: "NewUserVerifiedEmailFunction",
          description: "Marks the `verifiedEmail` property on a user to `TRUE`",
          entry: "newUserVerifiedEmail.ts", // Parent directory is the `functions`
          environment: {
            DYNAMO_TABLE_NAME: DYNAMO_TABLE_NAME,
          },
          dynamoWrite: true,
        },
      },
    ];

    STACK.map((item) => {
      /**
       * Create the queues
       */
      const createdQueue = new sqs.Queue(this, item.queue.queueName, {
        queueName: item.queue.queueName,
        visibilityTimeout: item.queue.visibilityTimeout,
        receiveMessageWaitTime: cdk.Duration.seconds(20),
        encryption: sqs.QueueEncryption.KMS,
      });

      // Export queue arn
      new cdk.CfnOutput(this, item.queue.queueName + "ARN", {
        value: createdQueue.queueArn,
        description: "The arn of the queue",
        exportName: item.queue.queueName + "ARN",
      });

      /**
       * Create the functions associated with each queue
       */
      let createdFunction;

      if (item.function) {
        createdFunction = new NodejsFunction(this, item.function.name, {
          memorySize: 128,
          timeout: cdk.Duration.seconds(5),
          runtime: lambda.Runtime.NODEJS_14_X,
          architecture: lambda.Architecture.ARM_64,
          bundling: {
            minify: true,
            externalModules: ["aws-sdk"],
          },
          handler: "main",
          entry: path.join(__dirname, `/../functions/` + item.function.entry),
          environment: item.function.environment,
        });

        /**
         * Link the queue and function together
         */
        createdFunction.addEventSource(
          new lambdaEventSources.SqsEventSource(createdQueue, {
            batchSize: 1,
          })
        );

        /**
         * Grant lambda email permissions if needed
         */
        item.function.sendEmail &&
          createdFunction.addToRolePolicy(
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: ["ses:SendEmail"],
              resources: [
                `arn:aws:ses:us-east-1:${AWS_ACCOUNT_ID}:identity/${SES_DOMAIN}`,
              ],
            })
          );

        /**
         * Grant lambda write access to Dynamo if needed
         *
         *
         */
        // TODO this is too broad (only updates) despite the function literally only able to do one thing
        item.function.dynamoWrite &&
          props.table.grantWriteData(createdFunction);
      }
    });
  }
}
