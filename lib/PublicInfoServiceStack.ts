import * as lambda from "@aws-cdk/aws-lambda";
import { NodejsFunction } from "@aws-cdk/aws-lambda-nodejs";
import * as path from "path";
import * as cdk from "@aws-cdk/core";

const DEFAULT_LAMBDA_CONFIG = {
  architecture: lambda.Architecture.ARM_64,
  runtime: lambda.Runtime.NODEJS_14_X,
  bundling: {
    minify: true,
    externalModules: ["aws-sdk"],
  },
  handler: "main",
};
export class CdkStarterStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const myFunction = new NodejsFunction(this, "my-function", {
      ...DEFAULT_LAMBDA_CONFIG,
      memorySize: 1024,
      timeout: cdk.Duration.seconds(5),
      description: "testing",
      entry: path.join(__dirname, "../services/PublicInfoService/test.ts"),
    });
  }
}
