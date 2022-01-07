import { Runtime, Architecture } from "@aws-cdk/aws-lambda";
import {
  NodejsFunction,
  NodejsFunctionProps,
} from "@aws-cdk/aws-lambda-nodejs";
import { Policy, PolicyStatement } from "@aws-cdk/aws-iam";
import { Table } from "@aws-cdk/aws-dynamodb";
import * as cdk from "@aws-cdk/core";
import * as path from "path";
import { HttpApi } from "@aws-cdk/aws-apigatewayv2";
import { LambdaProxyIntegration } from "@aws-cdk/aws-apigatewayv2-integrations";
import { CDKLambda } from "../types/main";

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
        memorySize: lambda.memorySize || 256,
        timeout: lambda.timeout || cdk.Duration.seconds(5),
        runtime: Runtime.NODEJS_14_X,
        architecture: Architecture.ARM_64,
        environment: lambda.environment,
        bundling: {
          minify: true,
          externalModules: ["aws-sdk"],
        },
        handler: "main",
        reservedConcurrentExecutions: lambda.maxConcurrency || 1,
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

    /**
     * dynamoActions and dynamoResources must both be defined, or undefined. They cannot exist without the other.
     */

    const policyExists =
      lambda.dynamoActions.length > 0 &&
      Object.keys(lambda.dynamoResources).length > 0;

    const policyUndefined =
      lambda.dynamoActions.length === 0 &&
      Object.keys(lambda.dynamoResources).length === 0;

    const validDynamoPolicy = policyExists || policyUndefined;

    if (!validDynamoPolicy) {
      throw `The function ${lambda.name} has ${
        lambda.dynamoActions.length
      } 'dynamoActions' but ${
        Object.keys(lambda.dynamoResources).length
      } 'dynamoResources'. This is invalid as you need a resource to perform actions on and vice versa. If one is defined, the other must be as well. `;
    }

    if (policyExists) {
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
