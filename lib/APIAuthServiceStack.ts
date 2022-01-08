import * as cdk from "@aws-cdk/core";
import { CDKLambda } from "../types/main";
import { LambdaAPIProps } from "../types/main";
import { HttpMethod } from "@aws-cdk/aws-apigatewayv2";
import createAPIGatewayFunctions from "../utils/createAPIGatewayFunctions";
export default class APIAuthServiceStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: LambdaAPIProps) {
    super(scope, id, props);

    const functions: CDKLambda[] = [
      {
        name: `request-login-link-function`,
        description: `Sends login links to the user`,
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
        description: `Logs a user in and creates an encrypted session cookie`,
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
        description: `Destroys the user's session cookie`, // TODO capture logout events in Dynamo
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
