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

      {
        functionName: `get-stage-info-function`,
        description: "Returns the info for the specified stage",
        filePath: `../functions/stages/get-stage-info.ts`,
        APIPath: "/openings/{openingId}/stages/{stageId}",
        method: HttpMethod.GET,
        dynamoActions: ["dynamodb:GetItem"],
        dynamoResources: {
          main: true,
        },
      },
      {
        functionName: `delete-stage-function`,
        description: "Deletes the specified stage",
        filePath: `../functions/stages/delete-stage.ts`,
        APIPath: "/openings/{openingId}/stages/{stageId}",
        method: HttpMethod.DELETE,
        dynamoActions: [
          "dynamodb:DeleteItem",
          "dynamodb:UpdateItem",
          "dynamodb:Query",
        ],
        dynamoResources: {
          main: true,
          GSI1: true,
        },
      },
      {
        functionName: `update-stage-function`,
        description: "Updates the specified stage",
        filePath: `../functions/stages/update-stage.ts`,
        APIPath: "/openings/{openingId}/stages/{stageId}",
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
