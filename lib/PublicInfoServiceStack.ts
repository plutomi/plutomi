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
        iam.ManagedPolicy.fromAwsManagedPolicyName("CloudWatchLogsFullAccess"), // TODO!
        // TODO!
        // Lambda needs permission to create cloudwatch logs!
      ],
    });

    // Reusable defaults for each function
    const sharableLambdaConfig = {
      // TODO this should be extracted and passed down as props to each stack
      handler: "handler",
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
        ...sharableLambdaConfig,
        functionName: `public-info-service-get-public-openings-in-org`,
        description: "Returns all public openings for a given orgId.",
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
      path: "/public/orgs/{orgId}/openings",
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
        ...sharableLambdaConfig,
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
      path: "/public/orgs/{orgId}/openings/{openingId}",
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
        ...sharableLambdaConfig,
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
      path: "/public/orgs/{orgId}",
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
        ...sharableLambdaConfig,
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
      path: "/public/orgs/{orgId}/stages/{stageId}",
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
        ...sharableLambdaConfig,
        functionName: `public-info-service-get-public-questions-in-stage`,
        description: "Returns public questions in a stage.",
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
      path: "/public/orgs/{orgId}/stages/{stageId}/questions",
      methods: [HttpMethod.GET],
    });

    /*
    -------------------------------------------------------
    Return public info for an applicant
    -------------------------------------------------------
    */
    const getPublicApplicantInfo = new NodejsFunction(
      this,
      "public-info-service-get-public-applicant-info",
      {
        ...sharableLambdaConfig,
        functionName: `public-info-service-get-public-applicant-info`,
        description: "Returns public information about an applicant.",
        entry: path.join(
          __dirname,
          `/../functions/PublicInfoService/get-public-applicant-info.ts`
        ),
      }
    );

    props.API.addRoutes({
      integration: new LambdaProxyIntegration({
        handler: getPublicApplicantInfo,
      }),
      path: "/public/orgs/{orgId}/applicants/{applicantId}",
      methods: [HttpMethod.GET],
    });
  }
}
