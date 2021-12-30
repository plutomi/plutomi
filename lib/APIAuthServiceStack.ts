import lambda = require("@aws-cdk/aws-lambda");
import integrations = require("@aws-cdk/aws-apigatewayv2-integrations");
import { NodejsFunction } from "@aws-cdk/aws-lambda-nodejs";
import * as path from "path";
import * as cdk from "@aws-cdk/core";
import * as dynamodb from "@aws-cdk/aws-dynamodb";
import * as apigw from "@aws-cdk/aws-apigatewayv2";
const DEFAULT_LAMBDA_CONFIG = {
  memorySize: 256,
  timeout: cdk.Duration.seconds(5),
  runtime: lambda.Runtime.NODEJS_14_X,
  architecture: lambda.Architecture.ARM_64,
  bundling: {
    minify: true,
    externalModules: ["aws-sdk"],
  },
  handler: "main",
};

interface APIAuthServiceProps extends cdk.StackProps {
  table: dynamodb.Table;
  api: apigw.HttpApi;
}

/**
 * Handles auth for our API.
 * This involves 4 main functions:
 * 1. Request login link [O]
 * 2. Validate login link & create session [O]
 * 3. Logout & delete session [O]
 * 4. Auth middleware to validate session on each followup request [O]
 */
export default class APIAuthServiceStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: APIAuthServiceProps) {
    super(scope, id, props);

    props.api.addRoutes({
      path: "/request-login-link",
      methods: [apigw.HttpMethod.POST],
      integration: new integrations.LambdaProxyIntegration({
        handler: new NodejsFunction(
          this,
          process.env.NODE_ENV + `-request-login-link-function`,
          {
            functionName: process.env.NODE_ENV + "-request-login-link-function",
            ...DEFAULT_LAMBDA_CONFIG,
            entry: path.join(
              __dirname,
              `../functions/auth/request-login-link.ts`
            ),
          }
        ),
      }),
    });
  }
}
