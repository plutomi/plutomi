import * as dotenv from "dotenv";
import * as dynamodb from "@aws-cdk/aws-dynamodb";
import * as path from "path";
import * as cdk from "@aws-cdk/core";
import * as sqs from "@aws-cdk/aws-sqs";
import * as lambda from "@aws-cdk/aws-lambda";
import * as lambdaEventSources from "@aws-cdk/aws-lambda-event-sources";
import { NodejsFunction } from "@aws-cdk/aws-lambda-nodejs";
import * as iam from "@aws-cdk/aws-iam";
import * as sns from "@aws-cdk/aws-sns";
import * as snsSubscriptions from "@aws-cdk/aws-sns-subscriptions";
import { STREAM_EVENTS } from "../Config";
import * as sfn from "@aws-cdk/aws-stepfunctions";
import * as tasks from "@aws-cdk/aws-stepfunctions-tasks";
import apigw = require("@aws-cdk/aws-apigatewayv2");

import {
  Effect,
  PolicyDocument,
  PolicyStatement,
  Role,
  ServicePrincipal,
} from "@aws-cdk/aws-iam";
import { table } from "console";

const resultDotEnv = dotenv.config({
  path: __dirname + `../../.env.${process.env.NODE_ENV}`,
});

if (resultDotEnv.error) {
  throw resultDotEnv.error;
}

interface NewUserStackProps extends cdk.StackProps {
  table: dynamodb.Table;
}

export default class StepFunctionStack extends cdk.Stack {
  /**
   * @param {cdk.Construct} scope
   * @param {string} id
   * @param {cdk.StackProps=} props
   */

  constructor(scope: cdk.App, id: string, props: NewUserStackProps) {
    super(scope, id, props);

    const AWS_ACCOUNT_ID: string = process.env.AWS_ACCOUNT_ID;
    const SES_DOMAIN = process.env.DOMAIN_NAME;
    const API_URL: string = process.env.API_URL;
    const DYNAMO_TABLE_NAME = process.env.DYNAMO_TABLE_NAME;

    /**
     * Step Function Starts Here
     */

    const updateUser = new tasks.DynamoUpdateItem(this, "UpdateItem", {
      key: {
        PK: tasks.DynamoAttributeValue.fromString(
          "USER#IgfNlIQwKS9TEiGDJ_5Gv94ZbtVODkFv8goZE6aSdc"
        ),
        SK: tasks.DynamoAttributeValue.fromString("USER"),
      },
      table: props.table,
      expressionAttributeValues: {
        ":GSI1SK": tasks.DynamoAttributeValue.fromString("BEans1"),
      },
      updateExpression: "SET GSI1SK = :GSI1SK",
    });

    const success = new sfn.Succeed(this, "We did it!");

    const definition = sfn.Chain.start(updateUser).next(success);

    const stateMachine = new sfn.StateMachine(this, "StateMachine", {
      definition,
      timeout: cdk.Duration.minutes(5),
    });

    props.table.grantFullAccess(stateMachine);
  }
}
