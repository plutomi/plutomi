import * as dotenv from "dotenv";
import { NodejsFunction } from "@aws-cdk/aws-lambda-nodejs";
import * as cdk from "@aws-cdk/core";
import * as events from "@aws-cdk/aws-events";
import * as sqs from "@aws-cdk/aws-sqs";
import * as sfn from "@aws-cdk/aws-stepfunctions";
import * as targets from "@aws-cdk/aws-events-targets";
import { ENTITY_TYPES, LOGIN_METHODS } from "../Config";
const resultDotEnv = dotenv.config({
  path: __dirname + `../../.env.${process.env.NODE_ENV}`,
});

if (resultDotEnv.error) {
  throw resultDotEnv.error;
}

interface EventBridgeStackProps extends cdk.StackProps {
  NewUserFlowSF: sfn.StateMachine;
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

    // We want to send all communication events to the step function, we can handle routing there
    new events.Rule(this, "NewUserRule", {
      description: "A new user has been signed up and verified their email",
      ruleName: "NewUserRule",
      targets: [new targets.SfnStateMachine(props.NewUserFlowSF)],
      eventPattern: {
        source: ["dynamodb.streams"],
        detail: {
          eventName: ["INSERT"],
          NewImage: {
            entityType: [
              ENTITY_TYPES.LOGIN_EVENT,
              ENTITY_TYPES.LOGIN_LINK,
              ENTITY_TYPES.APPLICANT,
            ],
          },
        },
      },
    });
  }
}
