import * as dotenv from "dotenv";
import * as cdk from "@aws-cdk/core";
import { ENTITY_TYPES } from "../Config";
import { EventBus, Rule } from "@aws-cdk/aws-events";
import { StateMachine } from "@aws-cdk/aws-stepfunctions";
import { SfnStateMachine } from "@aws-cdk/aws-events-targets";
const resultDotEnv = dotenv.config({
  path: `${process.cwd()}/.env.${process.env.NODE_ENV}`,
});

if (resultDotEnv.error) {
  throw resultDotEnv.error;
}

interface EventBridgeStackProps extends cdk.StackProps {
  CommsMachine: StateMachine;
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

    // Note, if we ever use AWS events directly, they will go to the default event bus and not this one.
    // This is for easy dev / prod testing
    // Create a new event bus
    const bus = new EventBus(this, `EventBus`, {
      eventBusName: `${process.env.NODE_ENV}-EventBus`,
    });

    // We want to send all communication events to the step function, we can handle routing there
    new Rule(this, "NewUserRule", {
      eventBus: bus,
      description: "A new user has been signed up and verified their email",
      ruleName: "NewUserRule",
      targets: [new SfnStateMachine(props.CommsMachine)],
      eventPattern: {
        source: ["dynamodb.streams"],
        detail: {
          eventName: ["INSERT"],
          NewImage: {
            entityType: [
              ENTITY_TYPES.LOGIN_EVENT,
              ENTITY_TYPES.LOGIN_LINK,
              ENTITY_TYPES.APPLICANT,
              ENTITY_TYPES.ORG_INVITE,
            ],
          },
        },
      },
    });
  }
}
