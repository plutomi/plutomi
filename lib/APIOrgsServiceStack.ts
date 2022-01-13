import * as cdk from "@aws-cdk/core";
import { CDKLambda } from "../types/main";
import { LambdaAPIProps } from "../types/main";
import { HttpMethod } from "@aws-cdk/aws-apigatewayv2";
import createAPIGatewayFunctions from "../utils/createAPIGatewayFunctions";

export default class APIOrgsServiceStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: LambdaAPIProps) {
    super(scope, id, props);

    const functions: CDKLambda[] = [
      {
        name: `create-org-function`,
        description: `As a user, creates an organization and joins it`,
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
        description: `Retrieves information for an org`,
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
        description: `Deletes the org the user is in`,
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
      {
        name: "get-openings-in-org-function",
        description: `Retrieves the openings in an org`,
        filePath: `../functions/orgs/get-openings.ts`,
        APIPath: `/openings`,
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
