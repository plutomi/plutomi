import * as cdk from "@aws-cdk/core";
import { CDKLambda } from "../types/main";
import { LambdaAPIProps } from "../types/main";
import { HttpMethod } from "@aws-cdk/aws-apigatewayv2";
import createAPIGatewayFunctions from "../utils/createAPIGatewayFunctions";

export default class APIOpeningsServiceStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: LambdaAPIProps) {
    super(scope, id, props);

    const functions: CDKLambda[] = [
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
        description: `Retrieve a specific opening `,
        filePath: `../functions/openings/get-opening-by-id.ts`,
        APIPath: "/openings/{openingId}",
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
