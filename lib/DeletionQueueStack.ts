import * as dotenv from "dotenv";
import * as cdk from "@aws-cdk/core";
import * as sqs from "@aws-cdk/aws-sqs";
const resultDotEnv = dotenv.config({
  path: `${process.cwd()}/.env.${process.env.NODE_ENV}`,
});

if (resultDotEnv.error) {
  throw resultDotEnv.error;
}

interface DeletionQueueStackprops extends cdk.StackProps {}
export default class DeletionQueueStack extends cdk.Stack {
  public DeletionQueue = sqs.Queue;
  /**
   *
   * @param {cdk.Construct} scope
   * @param {string} id
   * @param {cdk.StackProps=} props
   */
  constructor(scope: cdk.App, id: string, props: DeletionQueueStackprops) {
    super(scope, id, props);

    // Note, if we ever use AWS events directly, they will go to the default event bus and not this one.
    // This is for easy dev / prod testing
    this.DeletionQueue = new sqs.Queue(
      this,
      `${process.env.NODE_ENV}-DeletionQueue`,
      {
        queueName: `${process.env.NODE_ENV}-DeletionQueue`,
        receiveMessageWaitTime: cdk.Duration.seconds(20),
        retentionPeriod: cdk.Duration.seconds(1209600), // 14 days
      }
    );
  }
}
