import { LambdaProxyIntegration } from "@aws-cdk/aws-apigatewayv2-integrations";
import { HttpApi, HttpMethod } from "@aws-cdk/aws-apigatewayv2";
import { Runtime, Architecture } from "@aws-cdk/aws-lambda";
import { NodejsFunction } from "@aws-cdk/aws-lambda-nodejs";
import { Policy, PolicyStatement } from "@aws-cdk/aws-iam";
import { Table } from "@aws-cdk/aws-dynamodb";
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

interface APIAuthServiceProps extends cdk.StackProps {
  table: Table;
  api: HttpApi;
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

    /**
     * Request login link
     */
    const requestLoginLinkFunction = new NodejsFunction(
      this,
      `${process.env.NODE_ENV}-request-login-link-function`,
      {
        functionName: `${process.env.NODE_ENV}-request-login-link-function`,

        ...DEFAULT_LAMBDA_CONFIG,
        environment: {
          DYNAMO_TABLE_NAME: props.table.tableName,
          LOGIN_LINKS_PASSWORD: process.env.LOGIN_LINKS_PASSWORD,
        },
        entry: path.join(__dirname, `../functions/auth/request-login-link.ts`),
      }
    );
    props.api.addRoutes({
      path: "/request-login-link",
      methods: [HttpMethod.POST],
      integration: new LambdaProxyIntegration({
        handler: requestLoginLinkFunction,
      }),
    });
    // Grant minimum permissions
    const requestLoginLinkFunctionPolicy = new PolicyStatement({
      actions: ["dynamodb:Query", "dynamodb:PutItem", "dynamodb:GetItem"],
      resources: [
        `arn:aws:dynamodb:${cdk.Stack.of(this).region}:${
          cdk.Stack.of(this).account
        }:table/${props.table.tableName}`,
        `arn:aws:dynamodb:${cdk.Stack.of(this).region}:${
          cdk.Stack.of(this).account
        }:table/${props.table.tableName}/index/*`,
      ],
    });

    requestLoginLinkFunction.role.attachInlinePolicy(
      new Policy(this, "request-login-link-function-policy", {
        statements: [requestLoginLinkFunctionPolicy],
      })
    );

    /**
     * Login
     */
    const loginFunction = new NodejsFunction(
      this,
      `${process.env.NODE_ENV}-login-function`,
      {
        functionName: `${process.env.NODE_ENV}-login-function`,
        ...DEFAULT_LAMBDA_CONFIG,
        environment: {
          DYNAMO_TABLE_NAME: props.table.tableName,
          LOGIN_LINKS_PASSWORD: process.env.LOGIN_LINKS_PASSWORD,
          SESSION_PASSWORD: process.env.SESSION_PASSWORD,
        },
        entry: path.join(__dirname, `../functions/auth/login.ts`),
      }
    );
    props.api.addRoutes({
      path: "/login",
      methods: [HttpMethod.GET],
      integration: new LambdaProxyIntegration({
        handler: loginFunction,
      }),
    });

    // Grant minimum permissions
    const loginFunctionPolicy = new PolicyStatement({
      actions: [
        "dynamodb:Query",
        "dynamodb:PutItem",
        "dynamodb:GetItem",
        "dynamodb:DeleteItem",
      ],
      resources: [
        `arn:aws:dynamodb:${cdk.Stack.of(this).region}:${
          cdk.Stack.of(this).account
        }:table/${props.table.tableName}`,
        `arn:aws:dynamodb:${cdk.Stack.of(this).region}:${
          cdk.Stack.of(this).account
        }:table/${props.table.tableName}/index/*`,
      ],
    });

    loginFunction.role.attachInlinePolicy(
      new Policy(this, "login-function-policy", {
        statements: [loginFunctionPolicy],
      })
    );

    /**
     * Logout
     */
    const logoutFunction = new NodejsFunction(
      this,
      `${process.env.NODE_ENV}-logout-function`,
      {
        functionName: `${process.env.NODE_ENV}-logout-function`,
        ...DEFAULT_LAMBDA_CONFIG,
        entry: path.join(__dirname, `../functions/auth/logout.ts`),
      }
    );
    props.api.addRoutes({
      path: "/logout",
      methods: [HttpMethod.POST],
      integration: new LambdaProxyIntegration({
        handler: logoutFunction,
      }),
    });
  }
}
