import * as dotenv from "dotenv";
import * as dynamodb from "@aws-cdk/aws-dynamodb";
import * as cdk from "@aws-cdk/core";
import * as sfn from "@aws-cdk/aws-stepfunctions";
import * as tasks from "@aws-cdk/aws-stepfunctions-tasks";
import * as logs from "@aws-cdk/aws-logs";
const resultDotEnv = dotenv.config({
  path: __dirname + `../../.env.${process.env.NODE_ENV}`,
});

if (resultDotEnv.error) {
  throw resultDotEnv.error;
}

interface CommsMachineProps extends cdk.StackProps {
  table: dynamodb.Table;
}

export default class CommsMachineStack extends cdk.Stack {
  public CommsMachine: sfn.StateMachine;
  /**
   * @param {cdk.Construct} scope
   * @param {string} id
   * @param {cdk.StackProps=} props
   */

  constructor(scope: cdk.App, id: string, props: CommsMachineProps) {
    super(scope, id, props);

    /**
     * Generates an email & permissions to send with SES
     *
     * @param from - "Plutomi <admin@plutomi.com>"
     * @param to - Just the recipient email address
     * @param subject - Email subject
     * @param html - HTMl of your email
     */
    const generateEmail = ({
      from,
      to,
      subject,
      html,
    }: {
      from: string;
      to: string;
      subject: string;
      html: string;
    }) => {
      const template = {
        service: "ses",
        action: "sendEmail",
        parameters: {
          Destination: {
            "ToAddresses.$": to,
          },
          Message: {
            Subject: {
              Data: subject,
            },
            Body: {
              Html: {
                Data: html,
              },
            },
          },

          Source: from,
        },

        iamResources: [
          `arn:aws:ses:${cdk.Stack.of(this).region}:${
            cdk.Stack.of(this).account
          }:identity/${process.env.DOMAIN_NAME}`,
        ],
      };

      return template;
    };

    const updateUser = new tasks.CallAwsService(this, "UserVerifiedEmail", {
      service: "dynamodb",
      action: "updateItem",
      parameters: {
        TableName: props.table.tableName,
        Key: {
          PK: {
            "S.$": "$.detail.PK",
          },
          SK: {
            S: "USER",
          },
        },
        UpdateExpression: "SET orgId = :newValue",
        ExpressionAttributeValues: {
          ":newValue": {
            "S.$": "$.detail.PK",
          },
        },
      },
      iamResources: [props.table.tableArn],
    });

    const adminEmail = generateEmail({
      from: "Plutomi <admin@plutomi.com>",
      to: "$.detail.email",
      subject: "New user has signed up!",
      html: "<h1>New user!!!!!!!!!!!!!!!! From Steps</h1>",
    });

    const notifyAdmin = new tasks.CallAwsService(
      this,
      "NotifyAdminOfNewUser",
      adminEmail
    ); // TODO update once native integration is implemented

    const newUserEmail = generateEmail({
      from: "Plutomi <contact@plutomi.com>",
      to: "$.detail.email",
      subject: "Thank's for signing up!",
      html: "<h1>Hi!</h1><p>Please let us know if you have any questions or concerns!</p>",
    });
    const notifyUser = new tasks.CallAwsService( // TODO update once native integration is there
      this,
      "WelcomeNewUser",
      newUserEmail
    );

    const definition = new sfn.Parallel(this, "CommsMachineDefinition")
      .branch(updateUser)
      .branch(notifyAdmin)
      .branch(notifyUser);

    const log = new logs.LogGroup(this, "CommsMachineLogGroup");

    const logGroup = new logs.LogGroup(this, "MyLogGroup");

    this.CommsMachine = new sfn.StateMachine(this, "CommsMachine", {
      stateMachineName: "CommsMachine",
      definition,
      timeout: cdk.Duration.minutes(5),
      stateMachineType: sfn.StateMachineType.EXPRESS,
      logs: {
        // Not enabled by default
        destination: log,
        level: sfn.LogLevel.ALL,
      },
    });
    props.table.grantWriteData(this.CommsMachine);
  }
}
