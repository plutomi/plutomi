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

interface APIOrgsServiceProps extends cdk.StackProps {
  table: Table;
}

export default class APIOrgsServiceStack extends cdk.Stack {
  public readonly createOrgFunction: NodejsFunction;
  public readonly getOrgInfoFunction: NodejsFunction;
  public readonly deleteOrgFunction: NodejsFunction;
  public readonly getUsersInOrgFunction: NodejsFunction;

  constructor(scope: cdk.Construct, id: string, props?: APIOrgsServiceProps) {
    super(scope, id, props);

    this.createOrgFunction = new NodejsFunction(
      this,
      `${process.env.NODE_ENV}-create-org-function`,
      {
        functionName: `${process.env.NODE_ENV}-create-org-function`,
        ...DEFAULT_LAMBDA_CONFIG,
        environment: {
          DYNAMO_TABLE_NAME: props.table.tableName,
          SESSION_PASSWORD: process.env.SESSION_PASSWORD,
        },
        entry: path.join(__dirname, `../functions/orgs/create-org.ts`),
      }
    );

    const createOrgFunctionPolicy = new PolicyStatement({
      actions: ["dynamodb:Query", "dynamodb:PutItem", "dynamodb:UpdateItem"],
      resources: [
        `arn:aws:dynamodb:${cdk.Stack.of(this).region}:${
          cdk.Stack.of(this).account
        }:table/${props.table.tableName}`,
      ],
    });

    this.createOrgFunction.role.attachInlinePolicy(
      new Policy(this, "create-org-function-policy", {
        statements: [createOrgFunctionPolicy],
      })
    );

    this.getOrgInfoFunction = new NodejsFunction(
      this,
      `${process.env.NODE_ENV}-get-org-info-function`,
      {
        functionName: `${process.env.NODE_ENV}-get-org-info-function`,
        ...DEFAULT_LAMBDA_CONFIG,
        environment: {
          DYNAMO_TABLE_NAME: props.table.tableName,
          SESSION_PASSWORD: process.env.SESSION_PASSWORD,
        },
        entry: path.join(__dirname, `../functions/orgs/get-org-info.ts`),
      }
    );

    const getOrgInfoPolicy = new PolicyStatement({
      actions: ["dynamodb:GetItem"],
      resources: [
        `arn:aws:dynamodb:${cdk.Stack.of(this).region}:${
          cdk.Stack.of(this).account
        }:table/${props.table.tableName}`,
      ],
    });

    this.getOrgInfoFunction.role.attachInlinePolicy(
      new Policy(this, "get-org-info-function-policy", {
        statements: [getOrgInfoPolicy],
      })
    );

    this.deleteOrgFunction = new NodejsFunction(
      this,
      `${process.env.NODE_ENV}-delete-org-function`,
      {
        functionName: `${process.env.NODE_ENV}-delete-org-function`,
        ...DEFAULT_LAMBDA_CONFIG,
        environment: {
          DYNAMO_TABLE_NAME: props.table.tableName,
          SESSION_PASSWORD: process.env.SESSION_PASSWORD,
        },
        entry: path.join(__dirname, `../functions/orgs/delete-org.ts`),
      }
    );

    const deleteOrgPolicy = new PolicyStatement({
      actions: [
        "dynamodb:GetItem",
        "dynamodb:UpdateItem",
        "dynamodb:DeleteItem",
      ],
      resources: [
        `arn:aws:dynamodb:${cdk.Stack.of(this).region}:${
          cdk.Stack.of(this).account
        }:table/${props.table.tableName}`,
      ],
    });

    this.deleteOrgFunction.role.attachInlinePolicy(
      new Policy(this, "delete-org-function-policy", {
        statements: [deleteOrgPolicy],
      })
    );

    /**
     * Get users in org
     */
    this.getUsersInOrgFunction = new NodejsFunction(
      this,
      `${process.env.NODE_ENV}-get-users-in-org-function`,
      {
        functionName: `${process.env.NODE_ENV}-get-users-in-org-function`,
        ...DEFAULT_LAMBDA_CONFIG,
        environment: {
          DYNAMO_TABLE_NAME: props.table.tableName,
          SESSION_PASSWORD: process.env.SESSION_PASSWORD,
        },
        entry: path.join(__dirname, `../functions/orgs/get-users-in-org.ts`),
      }
    );

    const getUsersPolicy = new PolicyStatement({
      actions: ["dynamodb:Query"],
      resources: [
        `arn:aws:dynamodb:${cdk.Stack.of(this).region}:${
          cdk.Stack.of(this).account
        }:table/${props.table.tableName}/index/GSI1`,
      ],
    });

    this.getUsersInOrgFunction.role.attachInlinePolicy(
      new Policy(this, "get-users-in-org-function-policy", {
        statements: [getUsersPolicy],
      })
    );
  }
}
