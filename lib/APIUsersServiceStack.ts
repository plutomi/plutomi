import * as cdk from "@aws-cdk/core";
import { CDKLambda } from "../types/main";
import { Table } from "@aws-cdk/aws-dynamodb";
import { HttpApi, HttpMethod } from "@aws-cdk/aws-apigatewayv2";
import createAPIGatewayFunctions from "../utils/createAPIGatewayFunctions";
interface APIUsersServiceProps extends cdk.StackProps {
  table: Table;
  api: HttpApi;
}

export default class APIUsersServiceStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: APIUsersServiceProps) {
    super(scope, id, props);

    const functions: CDKLambda[] = [
      {
        name: `get-self-info-function`,
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
        environment: {
          SESSION_PASSWORD: process.env.SESSION_PASSWORD,
          DYNAMO_TABLE_NAME: props.table.tableName,
        },
        filePath: `../functions/users/update-user.ts`,
        APIPath: `/users/{userId}`,
        method: HttpMethod.PUT,
        dynamoActions: ["dynamodb:UpdateItem"],
        dynamoResources: {
          main: true,
        },
      },
      {
        name: `get-users-in-org-function`,
        environment: {
          DYNAMO_TABLE_NAME: props.table.tableName,
          SESSION_PASSWORD: process.env.SESSION_PASSWORD,
        },
        filePath: `../functions/users/get-users-in-org.ts`,
        APIPath: `/users`,
        method: HttpMethod.GET,
        dynamoActions: ["dynamodb:Query"],
        dynamoResources: {
          GSI1: true,
        },
      },
    ];

    createAPIGatewayFunctions(this, functions, props.api, props.table);
  }
}
