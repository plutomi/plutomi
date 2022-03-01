import * as dotenv from "dotenv";
import * as cdk from "@aws-cdk/core";
import * as sfn from "@aws-cdk/aws-stepfunctions";
import * as tasks from "@aws-cdk/aws-stepfunctions-tasks";
import { LogGroup } from "@aws-cdk/aws-logs";
import { Table } from "@aws-cdk/aws-dynamodb";
import {
  EMAILS,
  ENTITY_TYPES,
  DOMAIN_NAME,
  WEBSITE_URL,
} from "../Config";

const resultDotEnv = dotenv.config({
  path: `${process.cwd()}/.env.${process.env.NODE_ENV}`,
});

if (resultDotEnv.error) {
  throw resultDotEnv.error;
}

interface CommsMachineProps extends cdk.StackProps {
  table: Table;
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

    const setEmailToVerified = new tasks.DynamoUpdateItem(
      this,
      "UpdateVerifiedEmailStatus",
      {
        key: {
          PK: tasks.DynamoAttributeValue.fromString(
            sfn.JsonPath.stringAt("$.detail.NewImage.PK")
          ),

          SK: tasks.DynamoAttributeValue.fromString("USER"),
        },
        table: props.table,
        updateExpression: "SET verifiedEmail = :newValue",
        expressionAttributeValues: {
          ":newValue": tasks.DynamoAttributeValue.fromBoolean(true),
        },
        /**
         * If the value of ResultPath is null, that means that the state’s own raw output is discarded and its raw input becomes its result.
         * https://states-language.net/spec.html#filters
         * We want the original input to be passed down to the next tasks so that we can format emails
         */
        resultPath: sfn.JsonPath.DISCARD,
      }
    );
    setEmailToVerified.addRetry({ maxAttempts: 2 });

    const SES_SETTINGS = {
      service: "ses",
      action: "sendEmail",
      iamResources: [
        `arn:aws:ses:${this.region}:${this.account}:identity/${DOMAIN_NAME}`,
      ],
    };

    const notifyAdmin = new tasks.CallAwsService(this, "NotifyAdminOfNewUser", {
      //TODO update once native integration is implemented
      ...SES_SETTINGS,
      parameters: {
        Source: `Plutomi <${EMAILS.ADMIN}>`,
        Destination: {
          ToAddresses: [EMAILS.ADMIN],
        },
        Message: {
          Subject: {
            "Data.$": `States.Format('New user signed up - {}', $.detail.NewImage.user.email)`,
          },
          Body: {
            Html: {
              "Data.$": `States.Format('<h1>User ID: {}</h1>', $.detail.NewImage.user.userId)`,
            },
          },
        },
      },
    });

    const welcomeNewUser = new tasks.CallAwsService(this, "WelcomeNewUser", {
      //TODO update once native integration is implemented
      ...SES_SETTINGS,
      parameters: {
        Source: `Jose Valerio <${EMAILS.GENERAL}>`,
        Destination: {
          "ToAddresses.$": `States.Array($.detail.NewImage.user.email)`,
        },
        Message: {
          Subject: {
            Data: `Welcome to Plutomi!`,
          },
          Body: {
            Html: {
              Data: `<h1>Hello there!</h1><p>Just wanted to make you aware that this website is still in active development and <strong>you will lose your data!</strong><br><br>
                This project is completely open source -
              please let us know if you have any questions, concerns, or feature requests by replying to this email or <a href="https://github.com/plutomi/plutomi" rel=noreferrer target="_blank" >creating an issue on Github</a>!</p>`,
            },
          },
        },
      },
    });

    const sendLoginLink = new tasks.CallAwsService(this, "SendLoginLink", {
      //TODO update once native integration is implemented
      ...SES_SETTINGS,
      parameters: {
        Source: `Plutomi <${EMAILS.GENERAL}>`,
        Destination: {
          "ToAddresses.$": `States.Array($.detail.NewImage.user.email)`,
        },
        Message: {
          Subject: {
            Data: `Your magic login link is here!`,
          },
          Body: {
            Html: {
              // TODO add unsubscribe key
              "Data.$": `States.Format('<h1>Click <a href="{}" noreferrer target="_blank" >this link</a> to log in!</h1><p>It will expire {} so you better hurry.</p><p>If you did not request this link you can safely ignore it.',
              $.detail.NewImage.loginLinkUrl, $.detail.NewImage.relativeExpiry)`,
            },
          },
        },
      },
    });

    const sendApplicationLink = new tasks.CallAwsService(
      this,
      "SendApplicationLink",
      {
        //TODO update once native integration is implemented
        ...SES_SETTINGS,
        parameters: {
          Source: `Plutomi <${EMAILS.GENERAL}>`,
          Destination: {
            "ToAddresses.$": `States.Array($.detail.NewImage.email)`,
          },
          Message: {
            Subject: {
              Data: `Here is a link to your application!`,
            },
            Body: {
              Html: {
                // TODO add unsubscribe
                "Data.$": `States.Format('<h1><a href="${WEBSITE_URL}/{}/applicants/{}" rel=noreferrer target="_blank" >Click this link to view your application!</a></h1><p>If you did not request this link, you can safely ignore it.</p>', 
                $.detail.NewImage.orgId, $.detail.NewImage.applicantId)`,
              },
            },
          },
        },
      }
    );

    const sendOrgInvite = new tasks.CallAwsService(this, "SendOrgInvite", {
      //TODO update once native integration is implemented
      ...SES_SETTINGS,
      parameters: {
        Source: `Plutomi <${EMAILS.JOIN}>`,
        Destination: {
          "ToAddresses.$": `States.Array($.detail.NewImage.recipient.email)`,
        },
        Message: {
          Subject: {
            "Data.$": `States.Format('{} {} has invited you to join them on {}!',
            $.detail.NewImage.createdBy.firstName, $.detail.NewImage.createdBy.lastName, $.detail.NewImage.orgName)`,
          },
          Body: {
            Html: {
              // TODO add unsubscribe
              Data: `<h4>You can log in at <a href="${WEBSITE_URL}" target="_blank" rel=noreferrer>${WEBSITE_URL}</a> to accept their invite!</h4><p>If you believe this email was received in error, you can safely ignore it.</p>`,
            },
          },
        },
      },
    });

    const definition = new sfn.Choice(this, "EventType?")
      .when(
        sfn.Condition.stringEquals(
          "$.detail.entityType",
          ENTITY_TYPES.LOGIN_EVENT
        ),
        new sfn.Choice(this, "IsNewUser?").when(
          sfn.Condition.booleanEquals(
            "$.detail.NewImage.user.verifiedEmail",
            false
          ),
          setEmailToVerified.next(
            new sfn.Parallel(this, "SendNewUserComms")
              .branch(notifyAdmin)
              .branch(welcomeNewUser)
          )
        )
      )
      .when(
        sfn.Condition.stringEquals(
          "$.detail.entityType",
          ENTITY_TYPES.LOGIN_LINK
        ),

        sendLoginLink
      )
      .when(
        sfn.Condition.stringEquals(
          "$.detail.entityType",
          ENTITY_TYPES.APPLICANT
        ),
        sendApplicationLink
      )
      .when(
        sfn.Condition.stringEquals(
          "$.detail.entityType",
          ENTITY_TYPES.ORG_INVITE
        ),
        sendOrgInvite
      );
    const log = new LogGroup(
      this,
      `${process.env.NODE_ENV}-CommsMachineLogGroup`
    );

    this.CommsMachine = new sfn.StateMachine(this, "CommsMachine", {
      stateMachineName: `${process.env.NODE_ENV}-CommsMachine`,
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
    props.table.grantWriteData(this.CommsMachine); // TODO this event should just be update. No need for extra permissions
  }
}
