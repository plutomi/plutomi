import * as dotenv from "dotenv";
import * as cdk from "@aws-cdk/core";
import { Table } from "@aws-cdk/aws-dynamodb";
import * as path from "path";
import { Queue } from "@aws-cdk/aws-sqs";
import { NodejsFunction } from "@aws-cdk/aws-lambda-nodejs";
import { Duration } from "@aws-cdk/core";
import { SqsEventSource } from "@aws-cdk/aws-lambda-event-sources";
import { DEFAULT_LAMBDA_CONFIG } from "../Config";

const resultDotEnv = dotenv.config({
  path: __dirname + `../../.env.${process.env.NODE_ENV}`,
});

if (resultDotEnv.error) {
  throw resultDotEnv.error;
}

interface SendLoginLinkStackProps extends cdk.StackProps {
  table: Table;
}
export default class SendLoginLinkStack extends cdk.Stack {
  /**
   *
   * @param {cdk.Construct} scope
   * @param {string} id
   * @param {cdk.StackProps=} props
   */
  public readonly sendLoginLinkQueue: Queue;

  constructor(scope: cdk.App, id: string, props: SendLoginLinkStackProps) {
    super(scope, id, props);

    this.sendLoginLinkQueue = new Queue(this, "SendLoginLinkQueue", {
      queueName: "SendLoginLink",
      visibilityTimeout: Duration.seconds(10),
    });

    const SendLoginLinkProcessorFunction = new NodejsFunction(
      this,
      "SendLoginLinkProcessorFunction",
      {
        ...DEFAULT_LAMBDA_CONFIG,
        description:
          "Sends login links to users when they sign in with their email",
        entry: path.join(__dirname, `/../functions/sendLoginLink.ts`),
      }
    );

    SendLoginLinkProcessorFunction.addEventSource(
      new SqsEventSource(this.sendLoginLinkQueue, {
        batchSize: 1,
      })
    );
  }
}
