import { HttpApi, HttpMethod } from "@aws-cdk/aws-apigatewayv2";

import { LambdaProxyIntegration } from "@aws-cdk/aws-apigatewayv2-integrations";
import * as lambda from "@aws-cdk/aws-lambda";
import * as cdk from "@aws-cdk/core";
import * as path from "path";
import { NodejsFunction } from "@aws-cdk/aws-lambda-nodejs";
import * as iam from "@aws-cdk/aws-iam";
import * as ssm from "@aws-cdk/aws-ssm";
interface PublicInfoServiceStackProps extends cdk.StackProps {
  API: HttpApi;
}
export class PublicInfoServiceStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props: PublicInfoServiceStackProps) {
    super(scope, id, props);

    const DYNAMO_TABLE_NAME = ssm.StringParameter.fromStringParameterAttributes(
      this,
      "plutomi-dynamo-table-name",
      {
        parameterName: "/plutomi/DYNAMO_TABLE_NAME",
      }
    ).stringValue;

    // TODO FIX THIS ROLE
    const executionRole = new iam.Role(this, "execution-role", {
      assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
      managedPolicies: [
        //TODO lock down permissions!
        iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonDynamoDBFullAccess"),
      ],
    });

    const getPublicOpeningsFunction = new NodejsFunction(
      this,
      "public-info-service-get-public-openings",
      {
        functionName: `public-info-service-get-public-openings`,
        description: "Returns all public openings for a given org_id.",
        memorySize: 256,
        role: executionRole,
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
        environment: {
          DYNAMO_TABLE_NAME: DYNAMO_TABLE_NAME,
        },
      }
    );

    props.API.addRoutes({
      integration: new LambdaProxyIntegration({
        handler: getPublicOpeningsFunction,
      }),
      path: "/public/orgs/{org_id}/openings",
      methods: [HttpMethod.GET],
    });
  }
}
