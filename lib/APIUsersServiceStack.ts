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
        description: `Retrieves all users in the requester's org`,
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
