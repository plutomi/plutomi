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

    // Reusable defaults for each function
    const shareableConfig = {
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
    Return all public openings for an org
    -------------------------------------------------------
    */
    const getPublicOpeningsInOrgFunction = new NodejsFunction(
      this,
      "public-info-service-get-public-openings-in-org",
      {
        ...shareableConfig,
        functionName: `public-info-service-get-public-openings-in-org`,
        description: "Returns all public openings for a given org_id.",
        entry: path.join(
          __dirname,
          `/../functions/PublicInfoService/get-public-openings-in-org.ts`
        ),
      }
    );

    props.API.addRoutes({
      integration: new LambdaProxyIntegration({
        handler: getPublicOpeningsInOrgFunction,
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
        ...shareableConfig,
        functionName: `public-info-service-get-public-opening-info`,
        description: "Returns public information about an opening.",
        entry: path.join(
          __dirname,
          `/../functions/PublicInfoService/get-public-opening-info.ts`
        ),
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
        ...shareableConfig,
        functionName: `public-info-service-get-public-org-info`,
        description: "Returns public information about an org.",
        entry: path.join(
          __dirname,
          `/../functions/PublicInfoService/get-public-org-info.ts`
        ),
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
        ...shareableConfig,
        functionName: `public-info-service-get-public-stage-info`,
        description: "Returns public information about a stage.",
        entry: path.join(
          __dirname,
          `/../functions/PublicInfoService/get-public-stage-info.ts`
        ),
      }
    );

    props.API.addRoutes({
      integration: new LambdaProxyIntegration({
        handler: getPublicStageInfo,
      }),
      path: "/public/orgs/{org_id}/stages/{stage_id}",
      methods: [HttpMethod.GET],
    });

    /*
    -------------------------------------------------------
    Return public questions in a stage
    -------------------------------------------------------
    */
    const getPublicQuestionsInStage = new NodejsFunction(
      this,
      "public-info-service-get-public-questions-in-stage",
      {
        ...shareableConfig,
        functionName: `public-info-service-get-public-questions-in-stage`,
        description: "Returns public information about a stage.",
        entry: path.join(
          __dirname,
          `/../functions/PublicInfoService/get-public-questions-in-stage.ts`
        ),
      }
    );

    props.API.addRoutes({
      integration: new LambdaProxyIntegration({
        handler: getPublicQuestionsInStage,
      }),
      path: "/public/orgs/{org_id}/stages/{stage_id}/questions",
      methods: [HttpMethod.GET],
    });
  }
}
