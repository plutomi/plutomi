import { Runtime, Architecture } from "@aws-cdk/aws-lambda";
import { NodejsFunction } from "@aws-cdk/aws-lambda-nodejs";
import { Policy, PolicyStatement } from "@aws-cdk/aws-iam";
import { Table } from "@aws-cdk/aws-dynamodb";
import * as cdk from "@aws-cdk/core";
import * as path from "path";
import { HttpApi } from "@aws-cdk/aws-apigatewayv2";
import { LambdaProxyIntegration } from "@aws-cdk/aws-apigatewayv2-integrations";
import { CDKLambda } from "../types/main";

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

/**
 *  For CDK, this creates functions that are attached to API Gateway. These only really need DynamoDB permissions.
 * Centralizes config management, and the CDK stack is only responsible for declaring the function parameters.
 * @param functions
 * @param api
 * @param table
 */
export default function createAPIGatewayFunctions(
  stack: cdk.Stack,
  functions: CDKLambda[],
  api: HttpApi,
  table: Table
): void {
  for (const lambda of functions) {
    const func = new NodejsFunction(
      stack,
      `${process.env.NODE_ENV}-${lambda.name}`,
      {
        functionName: `${process.env.NODE_ENV}-${lambda.name}`,

        ...DEFAULT_LAMBDA_CONFIG,
        environment: lambda.environment,
        entry: path.join(__dirname, lambda.filePath),
      }
    );

    api.addRoutes({
      path: lambda.APIPath,
      methods: [lambda.method],
      integration: new LambdaProxyIntegration({
        handler: func,
      }),
    });

    const base = `arn:aws:dynamodb:${cdk.Stack.of(stack).region}:${
      cdk.Stack.of(stack).account
    }:table/${table.tableName}`;
    const needsTable = lambda.dynamoResources.main && base;
    const needsGSI1 = lambda.dynamoResources.GSI1 && `${base}/index/GSI1`;
    const needsGSI2 = lambda.dynamoResources.GSI2 && `${base}/index/GSI2`;

    const resources = [needsTable, needsGSI1, needsGSI2].filter(
      (item) => item !== undefined
    );

    // TODO dynamoActions has a dependency on dynamoResources
    if (lambda.dynamoActions.length > 0) {
      const policy = new PolicyStatement({
        actions: lambda.dynamoActions,
        resources,
      });

      func.role.attachInlinePolicy(
        new Policy(stack, `${process.env.NODE_ENV}-${lambda.name}-policy`, {
          statements: [policy],
        })
      );
    }
  }
}
