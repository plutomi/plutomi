import { LambdaProxyIntegration } from "@aws-cdk/aws-apigatewayv2-integrations";
import { HttpApi, HttpMethod } from "@aws-cdk/aws-apigatewayv2";
import { Runtime, Architecture } from "@aws-cdk/aws-lambda";
import { Table } from "@aws-cdk/aws-dynamodb";
import {
  HttpLambdaAuthorizer,
  HttpLambdaResponseType,
} from "@aws-cdk/aws-apigatewayv2-authorizers";
import * as cdk from "@aws-cdk/core";
import * as path from "path";
const DEFAULT_LAMBDA_CONFIG = {
  memorySize: 256,
  timeout: cdk.Duration.seconds(5),
  runtime: Runtime.NODEJS_14_X,
  architecture: Architecture.ARM_64,
  bundling: {
    minify: true,
    externalModules: ["aws-sdk"],
  },
  handler: "main",
  reservedConcurrentExecutions: 1, // TODO change to sane defaults
};

import { NodejsFunction } from "@aws-cdk/aws-lambda-nodejs";

interface APIUsersServiceProps extends cdk.StackProps {
  table: Table;
}

export default class APIUsersServiceStack extends cdk.Stack {
  public sessionInfoFunction: NodejsFunction;
  constructor(scope: cdk.Construct, id: string, props?: APIUsersServiceProps) {
    super(scope, id, props);

    /**
     * Session info function
     */
    this.sessionInfoFunction = new NodejsFunction(
      this,
      `${process.env.NODE_ENV}-self-function`,
      {
        functionName: `${process.env.NODE_ENV}-self-function`,
        ...DEFAULT_LAMBDA_CONFIG,
        entry: path.join(__dirname, `../functions/users/self.ts`),
      }
    );
  }
}
