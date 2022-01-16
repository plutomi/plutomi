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
        // dynamoActions: ["dynamodb:PutItem", "dynamodb:UpdateItem"],
        // dynamoResources: {
        //   main: true,
        // }
      },
    ];

    createAPIGatewayFunctions(this, functions, props.api, props.table);
  }
}
