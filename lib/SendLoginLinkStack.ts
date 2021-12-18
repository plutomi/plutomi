import * as dotenv from "dotenv";
import * as dynamodb from "@aws-cdk/aws-dynamodb";
import * as path from "path";
import * as cdk from "@aws-cdk/core";
import * as sqs from "@aws-cdk/aws-sqs";
import * as lambda from "@aws-cdk/aws-lambda";
import * as lambdaEventSources from "@aws-cdk/aws-lambda-event-sources";
import { NodejsFunction } from "@aws-cdk/aws-lambda-nodejs";
import * as iam from "@aws-cdk/aws-iam";
const resultDotEnv = dotenv.config({
  path: __dirname + `../../.env.${process.env.NODE_ENV}`,
});

if (resultDotEnv.error) {
  throw resultDotEnv.error;
}

interface SendLoginLinkStackProps extends cdk.StackProps {
  table: dynamodb.Table;
}
export default class SendLoginLinkStack extends cdk.Stack {
  /**
   *
   * @param {cdk.Construct} scope
   * @param {string} id
   * @param {cdk.StackProps=} props
   */
  public readonly sendLoginLinkQueue: sqs.Queue;

  constructor(scope: cdk.App, id: string, props: SendLoginLinkStackProps) {
    super(scope, id, props);

    this.sendLoginLinkQueue = new sqs.Queue(this, "SendLoginLinkQueue", {
      queueName: "SendLoginLink",
      visibilityTimeout: cdk.Duration.seconds(10),
    });

    const API_URL: string = process.env.API_URL;

    const SendLoginLinkProcessorFunction = new NodejsFunction(
      this,
      "SendLoginLinkProcessorFunction",
      {
        memorySize: 256,
        timeout: cdk.Duration.seconds(5),
        runtime: lambda.Runtime.NODEJS_14_X,
        architecture: lambda.Architecture.ARM_64,
        bundling: {
          minify: true,
          externalModules: ["aws-sdk"],
        },
        handler: "main",
        description:
          "Sends login links to users when they sign in with their email",
        entry: path.join(__dirname, `/../functions/sendLoginLink.ts`),
        environment: {
          API_URL: API_URL,
        },
      }
    );

    SendLoginLinkProcessorFunction.addEventSource(
      new lambdaEventSources.SqsEventSource(this.sendLoginLinkQueue, {
        batchSize: 1,
      })
    );

    const AWS_ACCOUNT_ID: string = process.env.AWS_ACCOUNT_ID;
    const SES_DOMAIN = process.env.DOMAIN_NAME;

    SendLoginLinkProcessorFunction.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ["ses:SendEmail"],
        resources: [
          `arn:aws:ses:us-east-1:${AWS_ACCOUNT_ID}:identity/${SES_DOMAIN}`,
        ],
      })
    );
  }
}
