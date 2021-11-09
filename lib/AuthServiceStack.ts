import { HttpApi, HttpMethod } from "@aws-cdk/aws-apigatewayv2";

import { LambdaProxyIntegration } from "@aws-cdk/aws-apigatewayv2-integrations";
import * as lambda from "@aws-cdk/aws-lambda";
import * as cdk from "@aws-cdk/core";
import * as path from "path";
import { NodejsFunction } from "@aws-cdk/aws-lambda-nodejs";
import * as iam from "@aws-cdk/aws-iam";
import * as ssm from "@aws-cdk/aws-ssm";

interface AuthServiceStackProps extends cdk.StackProps {
  API: HttpApi;
}

export class AuthServiceStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props: AuthServiceStackProps) {
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
        // iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonDynamoDBFullAccess"),
        iam.ManagedPolicy.fromAwsManagedPolicyName("CloudWatchLogsFullAccess"), // TODO!
        // TODO!
        // Lambda needs permission to create cloudwatch logs!
      ],
    });

    // Reusable defaults for each function
    const sharableLambdaConfig = {
      // TODO this should be extracted and passed down as props to each stack
      handler: "main",
      memorySize: 256,
      role: executionRole,
      timeout: cdk.Duration.seconds(5),
      runtime: lambda.Runtime.NODEJS_14_X,
      architecture: lambda.Architecture.ARM_64,
      bundling: {
        minify: true,
        externalModules: ["aws-sdk"],
      },
      environment: {
        DYNAMO_TABLE_NAME: DYNAMO_TABLE_NAME,
      },
    };
    /*
    -------------------------------------------------------
    Creates a session given a userId (TODO) and the login link id (TODO)
    -------------------------------------------------------
    */
    const createSessionFunction = new NodejsFunction(
      this,
      "auth-service-create-session",
      {
        ...sharableLambdaConfig,
        functionName: `auth-service-create-session`,
        description: "Creates a session for a user",
        entry: path.join(
          __dirname,
          `/../functions/AuthService/create-session.ts`
        ),
      }
    );

    props.API.addRoutes({
      integration: new LambdaProxyIntegration({
        handler: createSessionFunction,
      }),
      path: "/auth",
      methods: [HttpMethod.GET],
    });

    /*
    -------------------------------------------------------
   Verifies a session ID (will be the lambda authorizer in API Gateway)
    -------------------------------------------------------
    */
    const verifySessionFunction = new NodejsFunction(
      this,
      "auth-service-verify-session",
      {
        ...sharableLambdaConfig,
        functionName: `auth-service-verify-session`,
        description: "Verifies the user's session",
        entry: path.join(
          __dirname,
          `/../functions/AuthService/verify-session.ts`
        ),
      }
    );

    props.API.addRoutes({
      integration: new LambdaProxyIntegration({
        handler: verifySessionFunction,
      }),
      path: "/auth/verify",
      methods: [HttpMethod.GET],
    });
  }
}
