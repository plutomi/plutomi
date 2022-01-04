import { Runtime, Architecture } from "@aws-cdk/aws-lambda";
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

import { NodejsFunction } from "@aws-cdk/aws-lambda-nodejs";
import { Policy, PolicyStatement } from "@aws-cdk/aws-iam";

interface APIUsersServiceProps extends cdk.StackProps {
  table: Table;
}

export default class APIUsersServiceStack extends cdk.Stack {
  public readonly sessionInfoFunction: NodejsFunction;
  public readonly getUserByIdFunction: NodejsFunction;
  public readonly updateUserFunction: NodejsFunction;
  public readonly getUserInvitesFunction: NodejsFunction;
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
        environment: {
          DYNAMO_TABLE_NAME: props.table.tableName,
          SESSION_PASSWORD: process.env.SESSION_PASSWORD,
        },
        entry: path.join(__dirname, `../functions/users/self.ts`),
      }
    );

    // Grant minimum permissions
    const getSelfPolicy = new PolicyStatement({
      actions: ["dynamodb:GetItem"],
      resources: [
        `arn:aws:dynamodb:${cdk.Stack.of(this).region}:${
          cdk.Stack.of(this).account
        }:table/${props.table.tableName}`,
      ],
    });

    this.sessionInfoFunction.role.attachInlinePolicy(
      new Policy(this, "get-self-function-policy", {
        statements: [getSelfPolicy],
      })
    );

    /**
     * Get user by ID
     */
    this.getUserByIdFunction = new NodejsFunction(
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

    // Grant minimum permissions
    const getUserByIdPolicy = new PolicyStatement({
      actions: ["dynamodb:GetItem"],
      resources: [
        `arn:aws:dynamodb:${cdk.Stack.of(this).region}:${
          cdk.Stack.of(this).account
        }:table/${props.table.tableName}`,
      ],
    });

    this.getUserByIdFunction.role.attachInlinePolicy(
      new Policy(this, "get-user-by-id-function-policy", {
        statements: [getUserByIdPolicy],
      })
    );

    /**
     * Update user
     */
    this.updateUserFunction = new NodejsFunction(
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

    // Grant minimum permissions
    const updateUserPolicy = new PolicyStatement({
      actions: ["dynamodb:UpdateItem"],
      resources: [
        `arn:aws:dynamodb:${cdk.Stack.of(this).region}:${
          cdk.Stack.of(this).account
        }:table/${props.table.tableName}`,
      ],
    });

    this.updateUserFunction.role.attachInlinePolicy(
      new Policy(this, "update-user-function-policy", {
        statements: [updateUserPolicy],
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
        entry: path.join(__dirname, `../functions/users/get-invites.ts`),
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
  }
}
