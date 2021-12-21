import * as dotenv from "dotenv";
import * as dynamodb from "@aws-cdk/aws-dynamodb";
import * as lambda from "@aws-cdk/aws-lambda";
import * as path from "path";
import * as sns from "@aws-cdk/aws-sns";
import * as lambdaEventSources from "@aws-cdk/aws-lambda-event-sources";
import { NodejsFunction } from "@aws-cdk/aws-lambda-nodejs";
import * as cdk from "@aws-cdk/core";
import * as events from "@aws-cdk/aws-events";
import * as sqs from "@aws-cdk/aws-sqs";
import * as sfn from "@aws-cdk/aws-stepfunctions";
import * as targets from "@aws-cdk/aws-events-targets";
import { STREAM_EVENTS } from "../Config";
const resultDotEnv = dotenv.config({
  path: __dirname + `../../.env.${process.env.NODE_ENV}`,
});

if (resultDotEnv.error) {
  throw resultDotEnv.error;
}

interface EventBridgeStackProps extends cdk.StackProps {
  StreamProcessorFunction: NodejsFunction;
  SendLoginLinkQueue: sqs.Queue;
  NewUserAdminEmailQueue: sqs.Queue;
  NewUserVerifiedEmailQueue: sqs.Queue;
  CommsMachine: sfn.StateMachine;
}
export default class EventBridgeStack extends cdk.Stack {
  /**
   *
   * @param {cdk.Construct} scope
   * @param {string} id
   * @param {cdk.StackProps=} props
   */
  constructor(scope: cdk.App, id: string, props: EventBridgeStackProps) {
    super(scope, id, props);

    // Get a reference to the event bus
    const bus = events.EventBus.fromEventBusName(
      this,
      "DefaultEventBus",
      "default"
    );

    // Give our lambda acccess to the push events
    bus.grantPutEventsTo(props.StreamProcessorFunction);

    new events.Rule(this, "LoginLinkRule", {
      description: "A user has requested a login link",
      ruleName: "RequestedLoginLink",
      // targets: [new targets.SqsQueue(props.SendLoginLinkQueue)], // TODO move to comms machine
      eventPattern: {
        source: ["dynamodb.streams"],
        detailType: [STREAM_EVENTS.REQUEST_LOGIN_LINK],
      },
    });

    new events.Rule(this, "NewUserRule", {
      description: "A new user has been signed up and verified their email",
      ruleName: "NewUserRule",
      targets: [
        new targets.SfnStateMachine(props.CommsMachine, {
          input: events.RuleTargetInput.fromObject({
            email: events.EventField.fromPath("$.detail.email"),
            userId: events.EventField.fromPath("$.detail.userId"),
          }),
        }),
      ],
      eventPattern: {
        source: ["dynamodb.streams"],
        detailType: [STREAM_EVENTS.NEW_USER],
      },
    });
  }
}
