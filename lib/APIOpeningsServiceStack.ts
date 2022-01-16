import * as cdk from "@aws-cdk/core";
import { APIGatewayLambda } from "../types/main";
import { LambdaAPIProps } from "../types/main";
import { HttpMethod } from "@aws-cdk/aws-apigatewayv2";
import createAPIGatewayFunctions from "../utils/createAPIGatewayFunctions";

export default class APIOpeningsServiceStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: LambdaAPIProps) {
    super(scope, id, props);

    const functions: APIGatewayLambda[] = [
      {
        functionName: `create-openings-function`,
        description: `Creates openings in an org`,
        filePath: `../functions/openings/create-openings.ts`,
        APIPath: "/openings",
        method: HttpMethod.POST,
        dynamoActions: ["dynamodb:PutItem", "dynamodb:UpdateItem"],
        dynamoResources: {
          main: true,
        },
      },
      {
        functionName: `get-opening-by-id-function`,
        description: `Retrieve a specific opening`,
        filePath: `../functions/openings/get-opening-by-id.ts`,
        APIPath: "/openings/{openingId}",
        method: HttpMethod.GET,
        dynamoActions: ["dynamodb:GetItem"],
        dynamoResources: {
          main: true,
        },
      },
      {
        functionName: `delete-opening-function`,
        description: `Deletes a specific opening`,
        filePath: `../functions/openings/delete-openings.ts`,
        APIPath: "/openings/{openingId}",
        method: HttpMethod.DELETE,
        dynamoActions: ["dynamodb:DeleteItem", "dynamodb:UpdateItem"],
        dynamoResources: {
          main: true,
        },
      },
      {
        functionName: `update-opening-function`,
        description: `Updates a specific opening`,
        filePath: `../functions/openings/update-openings.ts`,
        APIPath: "/openings/{openingId}",
        method: HttpMethod.PUT,
        dynamoActions: ["dynamodb:UpdateItem"],
        dynamoResources: {
          main: true,
        },
      },
    ];

    createAPIGatewayFunctions(this, functions, props.api, props.table);
  }
}
