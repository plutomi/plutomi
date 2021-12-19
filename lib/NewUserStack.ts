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
import * as snsSubscriptions from "@aws-cdk/aws-sns-subscriptions";
import { STREAM_EVENTS } from "../Config";

const resultDotEnv = dotenv.config({
  path: __dirname + `../../.env.${process.env.NODE_ENV}`,
});

if (resultDotEnv.error) {
  throw resultDotEnv.error;
}

interface NewUserStackProps extends cdk.StackProps {
  table: dynamodb.Table;
  StreamProcessorTopic: sns.Topic;
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
   *
   * @param {cdk.Construct} scope
   * @param {string} id
   * @param {cdk.StackProps=} props
   */

  constructor(scope: cdk.App, id: string, props: NewUserStackProps) {
    super(scope, id, props);

    const AWS_ACCOUNT_ID: string = process.env.AWS_ACCOUNT_ID;
    const SES_DOMAIN = process.env.DOMAIN_NAME;
    const API_URL: string = process.env.API_URL;

    const STACK = [
      {
        queueName: "SendLoginLinkQueue",
        desiredEvents: [STREAM_EVENTS.SEND_LOGIN_LINK],
        visibilityTimeout: cdk.Duration.seconds(10),
        function: {
          name: "SendLoginLinkFunction",
          description:
            "Sends login links to users when they sign in with their email",
          entry: path.join(__dirname, `/../functions/sendLoginLink.ts`),
          sendEmail: true,
        },
      },
    ];

    STACK.map((item) => {
      /**
       * Create the queues
       */
      const createdQueue = new sqs.Queue(this, item.queueName, {
        queueName: item.queueName,
        visibilityTimeout: item.visibilityTimeout,
      });

      /**
       * Subscribe the queue to the topic with the desired events
       */
      props.StreamProcessorTopic.addSubscription(
        new snsSubscriptions.SqsSubscription(createdQueue, {
          filterPolicy: {
            eventType: sns.SubscriptionFilter.stringFilter({
              allowlist: item.desiredEvents,
            }),
          },
        })
      );

      /**
       * Create the functions associated with each queue
       */
      const createdFunction = new NodejsFunction(this, item.function.name, {
        memorySize: 256,
        timeout: cdk.Duration.seconds(5),
        runtime: lambda.Runtime.NODEJS_14_X,
        architecture: lambda.Architecture.ARM_64,
        bundling: {
          minify: true,
          externalModules: ["aws-sdk"],
        },
        handler: "main",
        environment: {
          API_URL: API_URL,
        },
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
    });
  }
}
