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
}

export default class APIInvitesServiceStack extends cdk.Stack {
  public readonly getOrgInvitesFunction: NodejsFunction;
  public readonly getUserInvitesFunction: NodejsFunction;
  public readonly createInvitesFunction: NodejsFunction;
  public readonly rejectInvitesFunction: NodejsFunction;

  constructor(scope: cdk.Construct, id: string, props?: APIAuthServiceProps) {
    super(scope, id, props);

    /**
     * Get  invites
     */
    this.getOrgInvitesFunction = new NodejsFunction(
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

    const getOrgInvitesFunctionFunctionPolicy = new PolicyStatement({
      actions: ["dynamodb:Query"],
      resources: [
        `arn:aws:dynamodb:${cdk.Stack.of(this).region}:${
          cdk.Stack.of(this).account
        }:table/${props.table.tableName}/index/GSI1`,
      ],
    });

    this.getOrgInvitesFunction.role.attachInlinePolicy(
      new Policy(this, "get-org-invites-function-policy", {
        statements: [getOrgInvitesFunctionFunctionPolicy],
      })
    );

    /**
     * Get Invites for User
     */
    this.getUserInvitesFunction = new NodejsFunction(
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

    const getInvitesForUserPolicy = new PolicyStatement({
      actions: ["dynamodb:Query"],
      resources: [
        `arn:aws:dynamodb:${cdk.Stack.of(this).region}:${
          cdk.Stack.of(this).account
        }:table/${props.table.tableName}`,
      ],
    });

    this.getUserInvitesFunction.role.attachInlinePolicy(
      new Policy(this, "get-user-invites-function-policy", {
        statements: [getInvitesForUserPolicy],
      })
    );

    /**
     * Create invites
     */
    this.createInvitesFunction = new NodejsFunction(
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

    this.createInvitesFunction.role.attachInlinePolicy(
      new Policy(this, "create-invites-function-policy", {
        statements: [createInvitesFunctionPolicy],
      })
    );

    /**
     * Reject invites
     */
    this.rejectInvitesFunction = new NodejsFunction(
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

    const rejectInvitesFunctionPolicy = new PolicyStatement({
      actions: ["dynamodb:DeleteItem"],
      resources: [
        `arn:aws:dynamodb:${cdk.Stack.of(this).region}:${
          cdk.Stack.of(this).account
        }:table/${props.table.tableName}`,
      ],
    });

    this.rejectInvitesFunction.role.attachInlinePolicy(
      new Policy(this, "reject-invites-function-policy", {
        statements: [rejectInvitesFunctionPolicy],
      })
    );
  }
}
