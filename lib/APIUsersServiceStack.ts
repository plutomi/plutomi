import { Runtime, Architecture } from "@aws-cdk/aws-lambda";
import { Table } from "@aws-cdk/aws-dynamodb";
import * as cdk from "@aws-cdk/core";
import * as path from "path";
import { HttpApi, HttpMethod } from "@aws-cdk/aws-apigatewayv2";
import { LambdaProxyIntegration } from "@aws-cdk/aws-apigatewayv2-integrations";

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
import { Policy, PolicyStatement } from "@aws-cdk/aws-iam";

interface APIUsersServiceProps extends cdk.StackProps {
  table: Table;
  api: HttpApi;
}

export default class APIUsersServiceStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: APIUsersServiceProps) {
    super(scope, id, props);

    /**
     * Info about the current user, ID gotten from session
     */
    const getSelfInfoFunction = new NodejsFunction(
      this,
      `${process.env.NODE_ENV}-get-self-info-function`,
      {
        functionName: `${process.env.NODE_ENV}-get-self-info-function`,
        ...DEFAULT_LAMBDA_CONFIG,
        environment: {
          DYNAMO_TABLE_NAME: props.table.tableName,
          SESSION_PASSWORD: process.env.SESSION_PASSWORD,
        },
        entry: path.join(__dirname, `../functions/users/get-self-info.ts`),
      }
    );

    props.api.addRoutes({
      path: "/users/self",
      methods: [HttpMethod.GET],
      integration: new LambdaProxyIntegration({
        handler: getSelfInfoFunction,
      }),
    });

    // Grant minimum permissions
    const getSelfPolicy = new PolicyStatement({
      actions: ["dynamodb:GetItem"],
      resources: [
        `arn:aws:dynamodb:${cdk.Stack.of(this).region}:${
          cdk.Stack.of(this).account
        }:table/${props.table.tableName}`,
      ],
    });

    getSelfInfoFunction.role.attachInlinePolicy(
      new Policy(this, "get-self-function-policy", {
        statements: [getSelfPolicy],
      })
    );

    /**
     * Get user by ID
     */
    const getUserByIdFunction = new NodejsFunction(
      this,
      `${process.env.NODE_ENV}-get-user-by-id-function`,
      {
        functionName: `${process.env.NODE_ENV}-get-user-by-id-function`,
        ...DEFAULT_LAMBDA_CONFIG,
        environment: {
          DYNAMO_TABLE_NAME: props.table.tableName,
          SESSION_PASSWORD: process.env.SESSION_PASSWORD,
        },
        entry: path.join(__dirname, `../functions/users/get-user-by-id.ts`),
      }
    );

    props.api.addRoutes({
      path: "/users/{userId}",
      methods: [HttpMethod.GET],
      integration: new LambdaProxyIntegration({
        handler: getUserByIdFunction,
      }),
    });

    // Grant minimum permissions
    const getUserByIdPolicy = new PolicyStatement({
      actions: ["dynamodb:GetItem"],
      resources: [
        `arn:aws:dynamodb:${cdk.Stack.of(this).region}:${
          cdk.Stack.of(this).account
        }:table/${props.table.tableName}`,
      ],
    });

    getUserByIdFunction.role.attachInlinePolicy(
      new Policy(this, "get-user-by-id-function-policy", {
        statements: [getUserByIdPolicy],
      })
    );

    /**
     * Update user
     */
    const updateUserFunction = new NodejsFunction(
      this,
      `${process.env.NODE_ENV}-update-user-function`,
      {
        functionName: `${process.env.NODE_ENV}-update-user-function`,
        ...DEFAULT_LAMBDA_CONFIG,
        environment: {
          SESSION_PASSWORD: process.env.SESSION_PASSWORD,
          DYNAMO_TABLE_NAME: props.table.tableName,
        },
        entry: path.join(__dirname, `../functions/users/update-user.ts`),
      }
    );

    props.api.addRoutes({
      path: "/users/{userId}",
      methods: [HttpMethod.PUT],
      integration: new LambdaProxyIntegration({
        handler: updateUserFunction,
      }),
    });

    // Grant minimum permissions
    const updateUserPolicy = new PolicyStatement({
      actions: ["dynamodb:UpdateItem"],
      resources: [
        `arn:aws:dynamodb:${cdk.Stack.of(this).region}:${
          cdk.Stack.of(this).account
        }:table/${props.table.tableName}`,
      ],
    });

    updateUserFunction.role.attachInlinePolicy(
      new Policy(this, "update-user-function-policy", {
        statements: [updateUserPolicy],
      })
    );

    /**
     * Get users in org
     */
    const getUsersInOrgFunction = new NodejsFunction(
      this,
      `${process.env.NODE_ENV}-get-users-in-org-function`,
      {
        functionName: `${process.env.NODE_ENV}-get-users-in-org-function`,
        ...DEFAULT_LAMBDA_CONFIG,
        environment: {
          DYNAMO_TABLE_NAME: props.table.tableName,
          SESSION_PASSWORD: process.env.SESSION_PASSWORD,
        },
        entry: path.join(__dirname, `../functions/users/get-users-in-org.ts`),
      }
    );

    props.api.addRoutes({
      path: "/users",
      methods: [HttpMethod.GET],
      integration: new LambdaProxyIntegration({
        handler: getUsersInOrgFunction,
      }),
    });

    const getUsersInOrgPolicy = new PolicyStatement({
      actions: ["dynamodb:Query"],
      resources: [
        `arn:aws:dynamodb:${cdk.Stack.of(this).region}:${
          cdk.Stack.of(this).account
        }:table/${props.table.tableName}/index/GSI1`,
      ],
    });

    getUsersInOrgFunction.role.attachInlinePolicy(
      new Policy(this, "get-users-in-org-function-policy", {
        statements: [getUsersInOrgPolicy],
      })
    );
  }
}
