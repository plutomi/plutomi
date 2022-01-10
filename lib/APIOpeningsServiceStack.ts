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
        name: `create-openings-function`,
        description: `Creates openings in an org`,
        environment: {
          DYNAMO_TABLE_NAME: props.table.tableName,
          SESSION_PASSWORD: process.env.SESSION_PASSWORD,
        },
        filePath: `../functions/openings/create-openings.ts`,
        APIPath: "/openings",
        method: HttpMethod.POST,
        dynamoActions: ["dynamodb:PutItem"], // TODO
        dynamoResources: {
          GSI1: true,
        },
      },
    ];

    createAPIGatewayFunctions(this, functions, props.api, props.table);
  }
}
