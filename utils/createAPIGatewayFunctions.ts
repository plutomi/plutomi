import {
  NodejsFunction,
  NodejsFunctionProps,
} from "@aws-cdk/aws-lambda-nodejs";
import { HttpNoneAuthorizer, HttpAuthorizer } from "@aws-cdk/aws-apigatewayv2";
import { Policy, PolicyStatement } from "@aws-cdk/aws-iam";
import { Table } from "@aws-cdk/aws-dynamodb";
import * as cdk from "@aws-cdk/core";
import * as path from "path";
import { HttpApi } from "@aws-cdk/aws-apigatewayv2";
import { LambdaProxyIntegration } from "@aws-cdk/aws-apigatewayv2-integrations";
import { CDKLambda } from "../types/main";
import { DEFAULT_LAMBDA_CONFIG } from "../bin/plutomi";

/**
 *  For CDK, this creates functions that are attached to API Gateway. These only really need DynamoDB permissions.
 * Centralizes config management, and the CDK stack is only responsible for declaring the function parameters.
 * @param functions
 * @param api
 * @param table
 * @param authorizer
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
      `${process.env.NODE_ENV}-${lambda.functionName}`,
      {
        entry: path.join(__dirname, lambda.filePath),
        ...DEFAULT_LAMBDA_CONFIG,
        // Overwrite defaults
        ...lambda,

        // Must have different names for dev / prod
        functionName: `${process.env.NODE_ENV}-${lambda.functionName}`,
        // These lambdas all need the table name
        environment: {
          ...lambda.environment,
          DYNAMO_TABLE_NAME: table.tableName,
        },
      }
    );

    api.addRoutes({
      path: lambda.APIPath,
      methods: [lambda.method],
      integration: new LambdaProxyIntegration({
        handler: func,
      }),
      authorizer: lambda.skipAuth && new HttpNoneAuthorizer(),
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
      throw `The function ${lambda.functionName} has ${
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
        new Policy(
          stack,
          `${process.env.NODE_ENV}-${lambda.functionName}-policy`,
          {
            statements: [policy],
          }
        )
      );
    }
  }
}
