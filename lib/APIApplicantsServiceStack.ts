import * as cdk from "@aws-cdk/core";
import { APIGatewayLambda } from "../types/main";
import { LambdaAPIProps } from "../types/main";
import { HttpMethod } from "@aws-cdk/aws-apigatewayv2";
import createAPIGatewayFunctions from "../utils/createAPIGatewayFunctions";

export default class APIApplicantsServiceStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: LambdaAPIProps) {
    super(scope, id, props);

    const functions: APIGatewayLambda[] = [
      {
        functionName: `create-applicants-function`,
        skipAuth: true,
        description: `Creates applicants in an org`,
        filePath: `../functions/applicants/create-applicants.ts`,
        APIPath: "/applicants",
        method: HttpMethod.POST,
        dynamoActions: [
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:GetItem",
        ],
        dynamoResources: {
          main: true,
        },
      },
    ];

    createAPIGatewayFunctions(this, functions, props.api, props.table);
  }
}
