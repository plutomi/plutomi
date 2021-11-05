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

    /*
    -------------------------------------------------------
    Return all public openings for an org
    -------------------------------------------------------
    */
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

    /*
    -------------------------------------------------------
    Return public info about a public opening
    -------------------------------------------------------
    */
    const getPublicOpeningInfoFunction = new NodejsFunction(
      this,
      "public-info-service-get-public-opening-info",
      {
        functionName: `public-info-service-get-public-opening-info`,
        description: "Returns public information about an opening.",
        memorySize: 256,
        role: executionRole,
        timeout: cdk.Duration.seconds(5),
        runtime: lambda.Runtime.NODEJS_14_X,
        handler: "main",
        entry: path.join(
          __dirname,
          `/../functions/PublicInfoService/get-public-opening-info.ts`
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
        handler: getPublicOpeningInfoFunction,
      }),
      path: "/public/orgs/{org_id}/openings/{opening_id}",
      methods: [HttpMethod.GET],
    });

    /*
    -------------------------------------------------------
    Return public info about an org
    -------------------------------------------------------
    */
    const getPublicOrgInfo = new NodejsFunction(
      this,
      "public-info-service-get-public-org-info",
      {
        functionName: `public-info-service-get-public-org-info`,
        description: "Returns public information about an org.",
        memorySize: 256,
        role: executionRole,
        timeout: cdk.Duration.seconds(5),
        runtime: lambda.Runtime.NODEJS_14_X,
        handler: "main",
        entry: path.join(
          __dirname,
          `/../functions/PublicInfoService/get-public-org-info.ts`
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
        handler: getPublicOrgInfo,
      }),
      path: "/public/orgs/{org_id}",
      methods: [HttpMethod.GET],
    });

    /*
    -------------------------------------------------------
    Return public info about a stage
    -------------------------------------------------------
    */
    const getPublicStageInfo = new NodejsFunction(
      this,
      "public-info-service-get-public-stage-info",
      {
        functionName: `public-info-service-get-public-stage-info`,
        description: "Returns public information about a stage.",
        memorySize: 256,
        role: executionRole,
        timeout: cdk.Duration.seconds(5),
        runtime: lambda.Runtime.NODEJS_14_X,
        handler: "main",
        entry: path.join(
          __dirname,
          `/../functions/PublicInfoService/get-public-stage-info.ts`
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
        handler: getPublicStageInfo,
      }),
      path: "/public/orgs/{org_id}/stages/{stage_id}",
      methods: [HttpMethod.GET],
    });
  }
}
