import { Table } from "@aws-cdk/aws-dynamodb";
import * as cdk from "@aws-cdk/core";
import { HttpApi, HttpMethod } from "@aws-cdk/aws-apigatewayv2";
import { CDKLambda } from "../types/main";
import createAPIGatewayFunctions from "../utils/createAPIGatewayFunctions";
interface APIAuthServiceProps extends cdk.StackProps {
  table: Table;
  api: HttpApi;
}

export default class APIAuthServiceStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: APIAuthServiceProps) {
    super(scope, id, props);

    const functions: CDKLambda[] = [
      {
        name: `request-login-link-function`,
        environment: {
          DYNAMO_TABLE_NAME: props.table.tableName,
          LOGIN_LINKS_PASSWORD: process.env.LOGIN_LINKS_PASSWORD,
        },
        filePath: `../functions/auth/request-login-link.ts`,
        APIPath: "/request-login-link",
        method: HttpMethod.POST,
        dynamoActions: [
          "dynamodb:Query",
          "dynamodb:PutItem",
          "dynamodb:GetItem",
        ],
        dynamoResources: {
          main: true,
          GSI1: true,
          GSI2: true,
        },
      },
      {
        name: `login-function`,
        environment: {
          DYNAMO_TABLE_NAME: props.table.tableName,
          LOGIN_LINKS_PASSWORD: process.env.LOGIN_LINKS_PASSWORD,
          SESSION_PASSWORD: process.env.SESSION_PASSWORD,
        },
        filePath: `../functions/auth/login.ts`,
        APIPath: "/login",
        method: HttpMethod.GET,
        dynamoActions: [
          "dynamodb:Query",
          "dynamodb:PutItem",
          "dynamodb:GetItem",
          "dynamodb:DeleteItem",
        ],
        dynamoResources: {
          main: true,
        },
      },

      {
        name: `logout-function`,
        environment: {
          DYNAMO_TABLE_NAME: props.table.tableName,
          LOGIN_LINKS_PASSWORD: process.env.LOGIN_LINKS_PASSWORD,
          SESSION_PASSWORD: process.env.SESSION_PASSWORD,
        },
        filePath: `../functions/auth/logout.ts`,
        APIPath: "/logout",
        method: HttpMethod.POST,
        dynamoActions: [],
        dynamoResources: {},
      },
    ];

    createAPIGatewayFunctions(this, functions, props.api, props.table);
  }
}
