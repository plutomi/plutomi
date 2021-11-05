import { HttpApi, HttpMethod } from "@aws-cdk/aws-apigatewayv2";
import { LambdaProxyIntegration } from "@aws-cdk/aws-apigatewayv2-integrations";
import * as lambda from "@aws-cdk/aws-lambda";
import * as cdk from "@aws-cdk/core";
import * as path from "path";
import { NodejsFunction } from "@aws-cdk/aws-lambda-nodejs";
import { Architecture } from "@aws-cdk/aws-lambda";
require("dotenv").config();

interface PublicInfoServiceStackProps extends cdk.StackProps {
  API: HttpApi;
}
export class PublicInfoServiceStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props: PublicInfoServiceStackProps) {
    super(scope, id, props);

    props.API.addRoutes({
      path: "/cdk",
      methods: [HttpMethod.GET],
      integration: new LambdaProxyIntegration({
        handler: new NodejsFunction(
          this,
          "public-info-service-get-public-openings",
          {
            memorySize: 256,
            functionName: `public-info-service-get-public-openings`,
            timeout: cdk.Duration.seconds(5),
            runtime: lambda.Runtime.NODEJS_14_X,
            handler: "main",
            entry: path.join(__dirname, `/../functions/get-public-openings.ts`),
            architecture: Architecture.ARM_64,
          }
        ),
      }),
    });
  }
}
