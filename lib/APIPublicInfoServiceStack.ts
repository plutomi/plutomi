import * as cdk from "@aws-cdk/core";
import { APIGatewayLambda } from "../types/main";
import { LambdaAPIProps } from "../types/main";
import { HttpMethod } from "@aws-cdk/aws-apigatewayv2";
import createAPIGatewayFunctions from "../utils/createAPIGatewayFunctions";

export default class APIPublicInfoServiceStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: LambdaAPIProps) {
    super(scope, id, props);

    const functions: APIGatewayLambda[] = [
      {
        skipAuth: true,
        reservedConcurrentExecutions: 5,
        functionName: `get-public-org-info-function`,
        description: `Reuturns publicly visible information about an org`,
        filePath: `../functions/publicInfo/get-public-org-info.ts`,
        APIPath: `/public/orgs/{orgId}`,
        method: HttpMethod.GET,
        dynamoActions: ["dynamodb:GetItem"],
        dynamoResources: {
          main: true,
        },
      },
      {
        skipAuth: true,
        reservedConcurrentExecutions: 5,
        functionName: `get-public-openings-in-org-function`,
        description: `Reuturns publicly visible openings in an org`,
        filePath: `../functions/publicInfo/get-public-openings-in-org.ts`,
        APIPath: `/public/orgs/{orgId}/openings`,
        method: HttpMethod.GET,
        dynamoActions: ["dynamodb:Query"],
        dynamoResources: {
          GSI1: true,
        },
      },
      {
        skipAuth: true,
        reservedConcurrentExecutions: 5,
        functionName: `get-public-opening-info-function`,
        description: `Reuturns publicly avaibale information about an opening`,
        filePath: `../functions/publicInfo/get-public-opening-info.ts`,
        APIPath: `/public/orgs/{orgId}/openings/{openingId}`,
        method: HttpMethod.GET,
        dynamoActions: ["dynamodb:GetItem"],
        dynamoResources: {
          main: true,
        },
      },
    ];

    createAPIGatewayFunctions(this, functions, props.api, props.table);
  }
}
