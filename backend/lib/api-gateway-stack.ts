import { CorsHttpMethod, HttpApi, HttpMethod } from "@aws-cdk/aws-apigatewayv2";
import { LambdaProxyIntegration } from "@aws-cdk/aws-apigatewayv2-integrations";
import * as lambda from "@aws-cdk/aws-lambda";
import * as cdk from "@aws-cdk/core";
import * as path from "path";
import { NodejsFunction } from "@aws-cdk/aws-lambda-nodejs";

export class ApiGatewayStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    // Create a DynamoDB table

    // Create HTTP Api
    const apigw = new HttpApi(this, "http-api-example", {
      description: "HTTP API example",
      corsPreflight: {
        allowHeaders: [
          "Content-Type",
          "X-Amz-Date",
          "Authorization",
          "X-Api-Key",
        ],
        allowMethods: [
          CorsHttpMethod.OPTIONS,
          CorsHttpMethod.GET,
          CorsHttpMethod.POST,
          CorsHttpMethod.PUT,
          CorsHttpMethod.PATCH,
          CorsHttpMethod.DELETE,
        ],
        allowCredentials: true,
        // allowOrigins: ["http://localhost:3000"],
      },
    });

    const getPublicOpeningsByOrgFunction = new NodejsFunction(
      this,
      "get-public-openings-by-org",
      {
        memorySize: 1024,
        timeout: cdk.Duration.seconds(5),
        runtime: lambda.Runtime.NODEJS_14_X,
        handler: "main",
        entry: path.join(
          __dirname,
          `/../functions/get-public-openings-by-org.ts`
        ),
      }
    );

    // 👇 add route for GET /todos
    apigw.addRoutes({
      path: "/api/cdk",
      methods: [HttpMethod.GET],
      integration: new LambdaProxyIntegration({
        handler: getPublicOpeningsByOrgFunction,
      }),
    });

    // 👇 create an Output for the API URL
    new cdk.CfnOutput(this, "apiUrl", { value: apigw.url as string }); // ?
  }
}
