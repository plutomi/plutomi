import * as dotenv from "dotenv";
import * as dynamodb from "@aws-cdk/aws-dynamodb";
import * as cdk from "@aws-cdk/core";
import * as sfn from "@aws-cdk/aws-stepfunctions";
import * as tasks from "@aws-cdk/aws-stepfunctions-tasks";
import * as logs from "@aws-cdk/aws-logs";
import { EMAILS } from "../Config";
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

    // const updateUser = new tasks.DynamoUpdateItem(this, "UpdateItem", {
    //   key: {
    //     PK: tasks.DynamoAttributeValue.fromString(
    //       "USER#IgfNlIQwKS9TEiGDJ_5Gv94ZbtVODkFv8goZE6aSdc"
    //     ),
    //     SK: tasks.DynamoAttributeValue.fromString("USER"),
    //   },
    //   table: props.table,
    //   expressionAttributeValues: {
    //     ":GSI1SK": tasks.DynamoAttributeValue.fromString("BEans1"),
    //   },
    //   updateExpression: "SET GSI1SK = :GSI1SK",
    // });
    const updateUser = new tasks.CallAwsService(
      this,
      "UpdateVerifiedEmailStatus",
      {
        service: "dynamodb",
        action: "updateItem",
        parameters: {
          TableName: props.table.tableName,
          Key: {
            PK: {
              "S.$": "$.PK",
            },
            SK: {
              S: "USER",
            },
          },
          UpdateExpression: "SET verifiedEmail = :newValue",
          ExpressionAttributeValues: {
            ":newValue": {
              S: "true", // TODO change to boolean
            },
          },
        },
        /**
         * If the value of ResultPath is null, that means that the state’s own raw output is discarded and its raw input becomes its result.
         * https://states-language.net/spec.html#filters
         * We want the original input to be passed down to the next tasks so that we can format emails
         */
        resultPath: sfn.JsonPath.DISCARD,
        iamResources: [props.table.tableArn],
      }
    );

    const adminFilter = new sfn.Pass(scope, "format-admin-email", {
      parameters: {
        "subject.$": sfn.JsonPath.stringAt(
          `States.Format('Admin BLOOP - {}', $.email)`
        ),
        html: "<h1>Testttttttttttttttttt</h1>",
      },
    });

    const notifyAdmin = new tasks.CallAwsService(this, "NotifyAdminOfNewUser", {
      service: "ses",
      action: "sendEmail",
      parameters: {
        Source: `Plutomi <${EMAILS.GENERAL}>`,
        Destination: {
          ToAddresses: [EMAILS.ADMIN],
        },
        Message: {
          Subject: {
            Data: "$.subject",
          },
          Body: {
            Html: {
              Data: "$.html",
            },
          },
        },
      },

      iamResources: [
        `arn:aws:ses:${cdk.Stack.of(this).region}:${
          cdk.Stack.of(this).account
        }:identity/${process.env.DOMAIN_NAME}`,
      ],
    }); //TODO update once native integration is implemented

    const newUserBloop = new sfn.Pass(scope, "format-newuser-email", {
      parameters: {
        "email.$": "$.email",
        "subject.$": sfn.JsonPath.stringAt(
          `States.Format('NEWUSER BLOOP - {}', $.email)`
        ),
      },
    });

    const newUserEmail = generateEmail({
      from: `Jose <${EMAILS.ADMIN}>`,
      to: "$.email",
      subject: "$.subject",
      html: `<h1>Hello!</h1><p>Just wanted to make you aware that this website is still in development.<br></br>
      Please let us know if you have any questions, concerns, or feature requests :)
      You can reply to this email or leave an issue <a href="https://github.com/plutomi/plutomi" rel=noreferrer target="_blank" >on Github</a>!</p>`,
    });
    const welcomeUser = new tasks.CallAwsService( // TODO update once native integration is there
      this,
      "WelcomeNewUser",
      newUserEmail
    );

    const definition = updateUser.next(
      new sfn.Parallel(this, "Parallel")
        .branch(adminFilter.next(notifyAdmin))
        .branch(newUserBloop.next(welcomeUser))
    );

    const log = new logs.LogGroup(this, "CommsMachineLogGroup");

    this.CommsMachine = new sfn.StateMachine(this, "CommsMachine", {
      stateMachineName: "CommsMachine",
      definition,
      timeout: cdk.Duration.minutes(5),
      stateMachineType: sfn.StateMachineType.EXPRESS,
      logs: {
        // Not enabled by default
        includeExecutionData: true,
        destination: log,
        level: sfn.LogLevel.ALL,
      },
    });
    props.table.grantWriteData(this.CommsMachine);
  }
}
