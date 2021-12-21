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

interface NewUserFlowSFProps extends cdk.StackProps {
  table: dynamodb.Table;
}

export default class NewUserFlowSFStack extends cdk.Stack {
  public NewUserFlowSF: sfn.StateMachine;
  /**
   * @param {cdk.Construct} scope
   * @param {string} id
   * @param {cdk.StackProps=} props
   */

  constructor(scope: cdk.App, id: string, props: NewUserFlowSFProps) {
    super(scope, id, props);

    const formatInput = new sfn.Pass(this, "FormatInput", {
      comment:
        "Formats the input from EventBridge to be used by downstream calls.",
      parameters: {
        "PK.$": `States.Format('USER#{}', $.userId)`,
        "adminEmailSubject.$": `States.Format('New user signed up - {}', $.email)`,
        "adminEmailBody.$": `States.Format('<h1>User ID: {}</h1>', $.userId)`,
        "newUserEmail.$": `States.Array($.email)`,
      },
    });

    const updateUser = new tasks.DynamoUpdateItem(
      this,
      "UpdateVerifiedEmailStatus",
      {
        key: {
          PK: tasks.DynamoAttributeValue.fromString(
            sfn.JsonPath.stringAt("$.PK")
          ),

          SK: tasks.DynamoAttributeValue.fromString("USER"),
        },
        table: props.table,
        updateExpression: "SET verifiedEmail = :newValue",
        expressionAttributeValues: {
          ":newValue": tasks.DynamoAttributeValue.fromBoolean(true),
        },
      }
    );

    const SES_SETTINGS = {
      service: "ses",
      action: "sendEmail",
      iamResources: [
        `arn:aws:ses:${cdk.Stack.of(this).region}:${
          cdk.Stack.of(this).account
        }:identity/${process.env.DOMAIN_NAME}`,
      ],
    };

    const notifyAdmin = new tasks.CallAwsService(this, "NotifyAdminOfNewUser", {
      //TODO update once native integration is implemented
      ...SES_SETTINGS,
      parameters: {
        Source: `Plutomi <${EMAILS.GENERAL}>`,
        Destination: {
          ToAddresses: [EMAILS.ADMIN],
        },
        Message: {
          Subject: {
            "Data.$": `$.adminEmailSubject`,
          },
          Body: {
            Html: {
              "Data.$": `$.adminEmailBody`,
            },
          },
        },
      },
    });

    const welcomeNewUser = new tasks.CallAwsService(this, "WelcomeNewUser", {
      //TODO update once native integration is implemented
      ...SES_SETTINGS,
      parameters: {
        Source: `Jose Valerio <${EMAILS.ADMIN}>`,
        Destination: {
          "ToAddresses.$": `$.newUserEmail`,
        },
        Message: {
          Subject: {
            Data: `Welcome to Plutomi!`,
          },
          Body: {
            Html: {
              Data: `<h1>Hello there!</h1><p>Just wanted to make you aware that this website is still in active development and <strong>you will lose your data!!!</strong><br><br>
                Please let us know if you have any questions, concerns, or feature requests by replying to this email or <a href="https://github.com/plutomi/plutomi" rel=noreferrer target="_blank" >creating an issue on Github</a>!</p>`,
            },
          },
        },
      },
    });

    const definition = formatInput.next(
      new sfn.Parallel(this, "Parallel")
        .branch(notifyAdmin)
        .branch(welcomeNewUser)
        .branch(updateUser)
    );

    const log = new logs.LogGroup(this, "NewUserFlowSFLogGroup");

    this.NewUserFlowSF = new sfn.StateMachine(this, "NewUserFlowSF", {
      stateMachineName: "NewUserFlowSF",
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
    props.table.grantWriteData(this.NewUserFlowSF);
  }
}
