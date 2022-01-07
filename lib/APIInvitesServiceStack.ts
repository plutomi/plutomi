import { Runtime, Architecture } from "@aws-cdk/aws-lambda";
import { NodejsFunction } from "@aws-cdk/aws-lambda-nodejs";
import { Policy, PolicyStatement } from "@aws-cdk/aws-iam";
import { Table } from "@aws-cdk/aws-dynamodb";
import * as cdk from "@aws-cdk/core";
import * as path from "path";
import { HttpApi, HttpMethod } from "@aws-cdk/aws-apigatewayv2";
import { LambdaProxyIntegration } from "@aws-cdk/aws-apigatewayv2-integrations";
import { CDKLambda } from "../types/main";
import createAPIGatewayFunctions from "../utils/createAPIGatewayFunctions";

interface APIAuthServiceProps extends cdk.StackProps {
  table: Table;
  api: HttpApi;
}

export default class APIInvitesServiceStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: APIAuthServiceProps) {
    super(scope, id, props);

    const functions: CDKLambda[] = [
      {
        name: `get-org-invites-function`,
        environment: {
          DYNAMO_TABLE_NAME: props.table.tableName,
          SESSION_PASSWORD: process.env.SESSION_PASSWORD,
        },
        filePath: `../functions/invites/get-org-invites.ts`,
        APIPath: "/orgs/{orgId}/invites",
        method: HttpMethod.GET,
        dynamoActions: ["dynamodb:Query"],
        dynamoResources: {
          GSI1: true,
        },
      },
      {
        name: `get-user-invites-function`,
        environment: {
          DYNAMO_TABLE_NAME: props.table.tableName,
          SESSION_PASSWORD: process.env.SESSION_PASSWORD,
        },
        filePath: `../functions/invites/get-user-invites.ts`,
        APIPath: "/invites",
        method: HttpMethod.GET,
        dynamoActions: ["dynamodb:Query"],
        dynamoResources: {
          main: true,
        },
      },
      {
        name: "create-invites-function",
        environment: {
          DYNAMO_TABLE_NAME: props.table.tableName,
          SESSION_PASSWORD: process.env.SESSION_PASSWORD,
        },
        filePath: `../functions/invites/create-invites.ts`,
        APIPath: `/invites`,
        method: HttpMethod.POST,
        dynamoActions: [
          "dynamodb:Query",
          "dynamodb:PutItem",
          "dynamodb:GetItem",
          "dynamodb:UpdateItem",
        ],
        dynamoResources: {
          main: true,
          GSI2: true,
        },
      },

      {
        name: `reject-invites-function`,
        environment: {
          DYNAMO_TABLE_NAME: props.table.tableName,
          SESSION_PASSWORD: process.env.SESSION_PASSWORD,
        },
        filePath: `../functions/invites/reject-invites.ts`,
        APIPath: `/invites/{inviteId}`,
        method: HttpMethod.DELETE,
        dynamoActions: ["dynamodb:DeleteItem"],
        dynamoResources: {
          main: true,
        },
      },
    ];

    createAPIGatewayFunctions(this, functions, props.api, props.table);
  }
}
