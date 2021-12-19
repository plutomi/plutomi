import * as dotenv from "dotenv";
import * as dynamodb from "@aws-cdk/aws-dynamodb";
import * as cdk from "@aws-cdk/core";
import * as sfn from "@aws-cdk/aws-stepfunctions";
import * as tasks from "@aws-cdk/aws-stepfunctions-tasks";

import {
  Effect,
  PolicyDocument,
  PolicyStatement,
  Role,
  ServicePrincipal,
} from "@aws-cdk/aws-iam";

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

    const notifyAdmin = new tasks.CallAwsService(this, "SES", {
      service: "ses",
      action: "sendEmail",

      parameters: {
        Destination: {
          ToAddresses: ["joseyvalerio@gmail.com"],
        },
        Message: {
          Subject: {
            Data: "New user has signed up!",
          },
          Body: {
            Html: {
              Data: "<h1>New user!!!!!!!!!!!!!!!! From Steps</h1>",
            },
          },
        },

        Source: "Plutomi <admin@plutomi.com>",
      },

      iamResources: [
        `arn:aws:ses:us-east-1:${cdk.Stack.of(this).account}:identity/${
          process.env.DOMAIN_NAME
        }`,
      ],
    });

    const notifyUser = new tasks.CallAwsService(this, "SES2", {
      service: "ses",
      action: "sendEmail",

      parameters: {
        Destination: {
          ToAddresses: ["joseyvalerio@gmail.com"],
        },
        Message: {
          Subject: {
            Data: "New user has signed up!",
          },
          Body: {
            Html: {
              Data: "<h1>New user!!!!!!!!!!!!!!!! From Steps</h1>",
            },
          },
        },

        Source: "Plutomi <admin@plutomi.com>",
      },

      iamResources: [
        `arn:aws:ses:us-east-1:${cdk.Stack.of(this).account}:identity/${
          process.env.DOMAIN_NAME
        }`,
      ],
    });

    const definition = new sfn.Parallel(this, "NewUserMachine")
      .branch(updateUser)
      .branch(notifyAdmin)
      .branch(notifyUser);

    const stateMachine = new sfn.StateMachine(this, "StateMachine", {
      definition,
      timeout: cdk.Duration.minutes(5),
      stateMachineType: sfn.StateMachineType.EXPRESS,
    });

    props.table.grantFullAccess(stateMachine);
  }
}
