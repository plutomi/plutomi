import * as cdk from "@aws-cdk/core";
import { CDKLambda } from "../types/main";
import { LambdaAPIProps } from "../types/main";
import { HttpMethod } from "@aws-cdk/aws-apigatewayv2";
import createAPIGatewayFunctions from "../utils/createAPIGatewayFunctions";

export default class APIUsersServiceStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: LambdaAPIProps) {
    super(scope, id, props);

    const functions: CDKLambda[] = [
      {
        name: `get-self-info-function`,
        description: `Retrieves info about the current user, ID is taken from the session cookie`,
        environment: {
          DYNAMO_TABLE_NAME: props.table.tableName,
          SESSION_PASSWORD: process.env.SESSION_PASSWORD,
        },
        filePath: `../functions/users/get-self-info.ts`,
        APIPath: `/users/self`,
        method: HttpMethod.GET,
        dynamoActions: ["dynamodb:GetItem"],
        dynamoResources: {
          main: true,
        },
      },

      {
        name: `get-user-by-id-function`,
        description: `Retrieves info about a specific user`,
        environment: {
          DYNAMO_TABLE_NAME: props.table.tableName,
          SESSION_PASSWORD: process.env.SESSION_PASSWORD,
        },
        filePath: `../functions/users/get-user-by-id.ts`,
        APIPath: `/users/{userId}`,
        method: HttpMethod.GET,
        dynamoActions: ["dynamodb:GetItem"],
        dynamoResources: {
          main: true,
        },
      },
      {
        name: `update-user-function`,
        description: `Updates a specific user`,
        environment: {
          SESSION_PASSWORD: process.env.SESSION_PASSWORD,
          DYNAMO_TABLE_NAME: props.table.tableName,
        },
        filePath: `../functions/users/update-user.ts`,
        APIPath: `/users/{userId}`,
        method: HttpMethod.PUT,
        dynamoActions: ["dynamodb:UpdateItem", "dynamodb:GetItem"],
        dynamoResources: {
          main: true,
        },
      },
      {
        name: `get-users-in-org-function`,
        description: `Retrieves all users in the requester's org`,
        environment: {
          DYNAMO_TABLE_NAME: props.table.tableName,
          SESSION_PASSWORD: process.env.SESSION_PASSWORD,
        },
        filePath: `../functions/users/get-users-in-org.ts`,
        APIPath: `/users`,
        method: HttpMethod.GET,
        dynamoActions: ["dynamodb:Query", "dynamodb:GetItem"],
        dynamoResources: {
          GSI1: true,
          main: true,
        },
      },
      {
        name: `DEBUGGING`,
        description: `DEBUGGING`,
        environment: {
          DYNAMO_TABLE_NAME: props.table.tableName,
          SESSION_PASSWORD: process.env.SESSION_PASSWORD,
        },
        filePath: `../functions/users/debugging.ts`,
        APIPath: `/debug`,
        method: HttpMethod.GET,
        dynamoActions: ["dynamodb:Query", "dynamodb:GetItem"],
        dynamoResources: {
          main: true,
          GSI1: true,
        },
      },
    ];

    createAPIGatewayFunctions(this, functions, props.api, props.table);
  }
}
