import { Table } from "@aws-cdk/aws-dynamodb";
import * as cdk from "@aws-cdk/core";
import { HttpApi, HttpMethod } from "@aws-cdk/aws-apigatewayv2";
import createAPIGatewayFunctions from "../utils/createAPIGatewayFunctions";
import { CDKLambda } from "../types/main";

interface APIOrgsServiceProps extends cdk.StackProps {
  table: Table;
  api: HttpApi;
}

export default class APIOrgsServiceStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: APIOrgsServiceProps) {
    super(scope, id, props);

    const functions: CDKLambda[] = [
      {
        name: `create-org-function`,
        environment: {
          DYNAMO_TABLE_NAME: props.table.tableName,
          SESSION_PASSWORD: process.env.SESSION_PASSWORD,
        },
        filePath: `../functions/orgs/create-org.ts`,
        APIPath: `/orgs`,
        method: HttpMethod.POST,
        dynamoActions: [
          "dynamodb:Query",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
        ],
        dynamoResources: {
          main: true,
        },
      },

      {
        name: `get-org-info-function`,
        environment: {
          DYNAMO_TABLE_NAME: props.table.tableName,
          SESSION_PASSWORD: process.env.SESSION_PASSWORD,
        },
        filePath: `../functions/orgs/get-org-info.ts`,
        APIPath: `/orgs/{orgId}`,
        method: HttpMethod.GET,
        dynamoActions: ["dynamodb:GetItem"],
        dynamoResources: {
          main: true,
        },
      },
      {
        name: `delete-org-function`,
        environment: {
          DYNAMO_TABLE_NAME: props.table.tableName,
          SESSION_PASSWORD: process.env.SESSION_PASSWORD,
        },
        filePath: `../functions/orgs/delete-org.ts`,
        APIPath: `/orgs/{orgId}`,
        method: HttpMethod.DELETE,
        dynamoActions: [
          "dynamodb:GetItem",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem",
        ],
        dynamoResources: {
          main: true,
        },
      },
    ];

    createAPIGatewayFunctions(this, functions, props.api, props.table);
  }
}
