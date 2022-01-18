import * as cdk from "@aws-cdk/core";
import { APIGatewayLambda } from "../types/main";
import { LambdaAPIProps } from "../types/main";
import { HttpMethod } from "@aws-cdk/aws-apigatewayv2";
import createAPIGatewayFunctions from "../utils/createAPIGatewayFunctions";

export default class APIStagesServiceStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: LambdaAPIProps) {
    super(scope, id, props);

    const functions: APIGatewayLambda[] = [
      {
        functionName: `create-stages-function`,
        description: `Creates stages in an an opening`,
        filePath: `../functions/stages/create-stages.ts`,
        APIPath: "/stages",
        method: HttpMethod.POST,
        dynamoActions: [
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:Query",
          "dynamodb:GetItem",
        ],
        dynamoResources: {
          main: true,
          GSI1: true,
        },
      },
      {
        functionName: `get-stages-in-opening-function`,
        description: "Returns the stages in the specified opening",
        filePath: `../functions/stages/get-stages-in-opening.ts`,
        APIPath: "/openings/{openingId}/stages",
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
