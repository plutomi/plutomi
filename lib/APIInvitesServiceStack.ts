import { Runtime, Architecture } from "@aws-cdk/aws-lambda";
import { NodejsFunction } from "@aws-cdk/aws-lambda-nodejs";
import { Policy, PolicyStatement } from "@aws-cdk/aws-iam";
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

interface APIAuthServiceProps extends cdk.StackProps {
  table: Table;
  api: HttpApi;
}

export default class APIInvitesServiceStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: APIAuthServiceProps) {
    super(scope, id, props);

    /**
     * Get org invites
     */
    const getOrgInvitesFunction = new NodejsFunction(
      this,
      `${process.env.NODE_ENV}-get-org-invites-function`,
      {
        functionName: `${process.env.NODE_ENV}-get-org-invites-function`,
        ...DEFAULT_LAMBDA_CONFIG,
        environment: {
          DYNAMO_TABLE_NAME: props.table.tableName,
          SESSION_PASSWORD: process.env.SESSION_PASSWORD,
        },
        entry: path.join(__dirname, `../functions/invites/get-org-invites.ts`),
      }
    );
    props.api.addRoutes({
      path: "/orgs/{orgId}/invites",
      methods: [HttpMethod.GET],
      integration: new LambdaProxyIntegration({
        handler: getOrgInvitesFunction,
      }),
    });

    const getOrgInvitesFunctionFunctionPolicy = new PolicyStatement({
      actions: ["dynamodb:Query"],
      resources: [
        `arn:aws:dynamodb:${cdk.Stack.of(this).region}:${
          cdk.Stack.of(this).account
        }:table/${props.table.tableName}/index/GSI1`,
      ],
    });

    getOrgInvitesFunction.role.attachInlinePolicy(
      new Policy(this, "get-org-invites-function-policy", {
        statements: [getOrgInvitesFunctionFunctionPolicy],
      })
    );

    /**
     * Get user invites
     */
    const getUserInvitesFunction = new NodejsFunction(
      this,
      `${process.env.NODE_ENV}-get-user-invites-function`,
      {
        functionName: `${process.env.NODE_ENV}-get-user-invites-function`,
        ...DEFAULT_LAMBDA_CONFIG,
        environment: {
          DYNAMO_TABLE_NAME: props.table.tableName,
          SESSION_PASSWORD: process.env.SESSION_PASSWORD,
        },
        entry: path.join(__dirname, `../functions/invites/get-user-invites.ts`),
      }
    );
    props.api.addRoutes({
      path: "/invites",
      methods: [HttpMethod.GET],
      integration: new LambdaProxyIntegration({
        handler: getUserInvitesFunction,
      }),
    });

    const getInvitesForUserPolicy = new PolicyStatement({
      actions: ["dynamodb:Query"],
      resources: [
        `arn:aws:dynamodb:${cdk.Stack.of(this).region}:${
          cdk.Stack.of(this).account
        }:table/${props.table.tableName}`,
      ],
    });

    getUserInvitesFunction.role.attachInlinePolicy(
      new Policy(this, "get-user-invites-function-policy", {
        statements: [getInvitesForUserPolicy],
      })
    );

    /**
     * Create invites
     */
    const createInvitesFunction = new NodejsFunction(
      this,
      `${process.env.NODE_ENV}-create-invites-function`,
      {
        functionName: `${process.env.NODE_ENV}-create-invites-function`,
        ...DEFAULT_LAMBDA_CONFIG,
        environment: {
          DYNAMO_TABLE_NAME: props.table.tableName,
          SESSION_PASSWORD: process.env.SESSION_PASSWORD,
        },
        entry: path.join(__dirname, `../functions/invites/create-invites.ts`),
      }
    );

    props.api.addRoutes({
      path: "/invites",
      methods: [HttpMethod.POST],
      integration: new LambdaProxyIntegration({
        handler: createInvitesFunction,
      }),
    });

    const createInvitesFunctionPolicy = new PolicyStatement({
      actions: [
        "dynamodb:Query",
        "dynamodb:PutItem",
        "dynamodb:GetItem",
        "dynamodb:UpdateItem",
      ],
      resources: [
        `arn:aws:dynamodb:${cdk.Stack.of(this).region}:${
          cdk.Stack.of(this).account
        }:table/${props.table.tableName}`,
        `arn:aws:dynamodb:${cdk.Stack.of(this).region}:${
          cdk.Stack.of(this).account
        }:table/${props.table.tableName}/index/GSI2`,
      ],
    });

    createInvitesFunction.role.attachInlinePolicy(
      new Policy(this, "create-invites-function-policy", {
        statements: [createInvitesFunctionPolicy],
      })
    );

    /**
     * Reject invites
     */
    const rejectInvitesFunction = new NodejsFunction(
      this,
      `${process.env.NODE_ENV}-reject-invites-function`,
      {
        functionName: `${process.env.NODE_ENV}-reject-invites-function`,
        ...DEFAULT_LAMBDA_CONFIG,
        environment: {
          DYNAMO_TABLE_NAME: props.table.tableName,
          SESSION_PASSWORD: process.env.SESSION_PASSWORD,
        },
        entry: path.join(__dirname, `../functions/invites/reject-invites.ts`),
      }
    );

    props.api.addRoutes({
      path: "/invites/{inviteId}",
      methods: [HttpMethod.DELETE],
      integration: new LambdaProxyIntegration({
        handler: rejectInvitesFunction,
      }),
    });

    const rejectInvitesFunctionPolicy = new PolicyStatement({
      actions: ["dynamodb:DeleteItem"],
      resources: [
        `arn:aws:dynamodb:${cdk.Stack.of(this).region}:${
          cdk.Stack.of(this).account
        }:table/${props.table.tableName}`,
      ],
    });

    rejectInvitesFunction.role.attachInlinePolicy(
      new Policy(this, "reject-invites-function-policy", {
        statements: [rejectInvitesFunctionPolicy],
      })
    );
  }
}
