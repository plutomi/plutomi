import * as cdk from "@aws-cdk/core";
import { CDKLambda } from "../types/main";
import { LambdaAPIProps } from "../types/main";
import { HttpMethod } from "@aws-cdk/aws-apigatewayv2";
import createAPIGatewayFunctions from "../utils/createAPIGatewayFunctions";

export default class APIInvitesServiceStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: LambdaAPIProps) {
    super(scope, id, props);

    const functions: CDKLambda[] = [
      {
        functionName: `get-org-invites-function`,
        description: `Retrieves invites for an org that haven't been accepted yet`,
        filePath: `../functions/invites/get-org-invites.ts`,
        APIPath: "/orgs/{orgId}/invites",
        method: HttpMethod.GET,
        dynamoActions: ["dynamodb:Query"],
        dynamoResources: {
          GSI1: true,
        },
      },
      {
        functionName: `get-user-invites-function`,
        description: `Retrieves invites for a user that haven't been accepted yet`,
        filePath: `../functions/invites/get-user-invites.ts`,
        APIPath: "/invites",
        method: HttpMethod.GET,
        dynamoActions: ["dynamodb:Query"],
        dynamoResources: {
          main: true,
        },
      },
      {
        functionName: "create-invites-function",
        description: `Creates an invite for a user to join an org`,
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
        functionName: `accept-invites-function`,
        description: `Accepts an org invite`,
        filePath: `../functions/invites/accept-invites.ts`,
        APIPath: `/invites/{inviteId}`,
        method: HttpMethod.POST,
        dynamoActions: [
          "dynamodb:GetItem",
          "dynamodb:DeleteItem",
          "dynamodb:UpdateItem",
        ],
        dynamoResources: {
          main: true,
        },
      },
      {
        functionName: `reject-invites-function`,
        description: `Rejectes an org invite`,
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
