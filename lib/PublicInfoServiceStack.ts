import { HttpApi, HttpMethod } from "@aws-cdk/aws-apigatewayv2";
import { LambdaProxyIntegration } from "@aws-cdk/aws-apigatewayv2-integrations";
import * as lambda from "@aws-cdk/aws-lambda";
import * as cdk from "@aws-cdk/core";
import * as path from "path";
import { NodejsFunction } from "@aws-cdk/aws-lambda-nodejs";
require("dotenv").config();

interface PublicInfoServiceStackProps extends cdk.StackProps {
  API: HttpApi;
}
export class PublicInfoServiceStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props: PublicInfoServiceStackProps) {
    super(scope, id, props);

    // const getPublicOpeningsFunction = new NodejsFunction(
    //   this,
    //   "public-info-service-get-public-openings",
    //   {
    //     memorySize: 256,
    //     functionName: `public-info-service-get-public-openings`,
    //     timeout: cdk.Duration.seconds(5),
    //     runtime: lambda.Runtime.NODEJS_14_X,
    //     handler: "main",
    //     entry: path.join(__dirname, `/../functions/get-public-openings.ts`),
    //     architecture: lambda.Architecture.ARM_64,
    //   }
    // );

    const getPublicOpeningsFunction = new NodejsFunction(
      this,
      "public-info-service-get-public-openings",
      {
        memorySize: 256,
        functionName: `public-info-service-get-public-openings`,
        timeout: cdk.Duration.seconds(5),
        runtime: lambda.Runtime.NODEJS_14_X,
        handler: "main",
        entry: path.join(
          __dirname,
          `/../functions/PublicInfoService/get-public-openings.ts`
        ),
        architecture: lambda.Architecture.ARM_64,
        bundling: {
          minify: true,
          externalModules: ["aws-sdk"],
        },
      }
    );

    props.API.addRoutes({
      integration: new LambdaProxyIntegration({
        handler: getPublicOpeningsFunction,
      }),
      path: "/cdk",
      methods: [HttpMethod.GET],
    });
  }
}
