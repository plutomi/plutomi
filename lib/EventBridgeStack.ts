import * as dotenv from "dotenv";
import * as cdk from "@aws-cdk/core";
import { ENTITY_TYPES } from "../Config";
import { EventBus, Rule } from "@aws-cdk/aws-events";
import { StateMachine } from "@aws-cdk/aws-stepfunctions";
import { SfnStateMachine } from "@aws-cdk/aws-events-targets";

interface EventBridgeStackProps extends cdk.StackProps {
  CommsMachine: StateMachine;
  DeleteChildrenMachine: StateMachine;
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
    const bus = new EventBus(this, `${process.env.NODE_ENV}-EventBus`, {
      eventBusName: `${process.env.NODE_ENV}-EventBus`,
    });

    bus.archive(`${process.env.NODE_ENV}-EventArchive`, {
      archiveName: `${process.env.NODE_ENV}-EventArchive`,
      eventPattern: {
        account: [cdk.Stack.of(this).account],
      },
      retention: cdk.Duration.days(365),
    });
    // We want to send all communication events to the step function, we can handle routing there
    new Rule(this, "NeedsCommsRule", {
      eventBus: bus,
      description:
        "Rule that checks if an action needs further comms such as login links or welcome emails. Forwards to the `CommsMachine` step function.",
      ruleName: "NeedsCommsRule",
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
              ENTITY_TYPES.OPENING,
              ENTITY_TYPES.STAGE,
            ],
          },
        },
      },
    });

    // We want to send all deletion events to the step function, we can handle routing there
    new Rule(this, "DeletionRule", {
      eventBus: bus,
      description:
        "Rule that checks if an action needs further comms such as login links or welcome emails. Forwards to the `CommsMachine` step function.",
      ruleName: "DeletionRule",
      targets: [new SfnStateMachine(props.DeleteChildrenMachine)],
      eventPattern: {
        source: ["dynamodb.streams"],
        detail: {
          eventName: ["REMOVE"],
          OldImage: {
            entityType: [
              // TODO other entities
              ENTITY_TYPES.ORG,
              ENTITY_TYPES.OPENING,
              ENTITY_TYPES.QUESTION,
            ],
          },
        },
      },
    });
  }
}
