import * as dotenv from 'dotenv';
import * as cdk from '@aws-cdk/core';
import { EventBus, Rule } from '@aws-cdk/aws-events';
import { StateMachine } from '@aws-cdk/aws-stepfunctions';
import { SfnStateMachine } from '@aws-cdk/aws-events-targets';
import { DynamoStreamTypes, Entities } from '../Config';

const resultDotEnv = dotenv.config({
  path: `${process.cwd()}/.env.${process.env.NODE_ENV}`,
});

if (resultDotEnv.error) {
  throw resultDotEnv.error;
}

enum Rules {
  /**
   * Any events that require extra communication to be sent such as an email
   */
  NeedsComms = 'NeedsCommsRule',
  /**
   * Any entity that might have children that need to be deleted when the top level entity is deleted.
   * For example: An org being deleted requires that all openings be deleted. When an opening is deleted,
   * we need to delete all stages in the opening.
   */
  DeleteChildren = 'DeleteChildrenRule',

  /**
   * All applicant events of {@link DynamoStreamTypes} are sent to the webhook machine.
   *
   */

  ApplicantEventsRule = 'ApplicantEventsRule',
}

enum Source {
  DynamoStream = 'dynamo.stream',
}

interface EventBridgeStackProps extends cdk.StackProps {
  CommsMachine: StateMachine;
  DeleteChildrenMachine: StateMachine;
  WebhooksMachine: StateMachine;
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

    /**
     * Note, if we ever use AWS events directly, they will go to the default event bus and not this one.
     * This is for easy dev / prod testing
     */
    const bus = new EventBus(this, `${process.env.NODE_ENV}-EventBus`, {
      eventBusName: `${process.env.NODE_ENV}-EventBus`,
    });

    bus.archive(`${process.env.NODE_ENV}-EventArchive`, {
      archiveName: `${process.env.NODE_ENV}-EventArchive`,
      eventPattern: {
        account: [cdk.Stack.of(this).account],
      },
      retention: cdk.Duration.days(3),
    });

    // We want to send all communication events to the step function, we can handle routing there
    new Rule(this, Rules.NeedsComms, {
      eventBus: bus,
      description: 'Rule for actions that might require further comms.',
      ruleName: Rules.NeedsComms,
      targets: [new SfnStateMachine(props.CommsMachine)],
      eventPattern: {
        source: [Source.DynamoStream],
        detail: {
          eventName: [DynamoStreamTypes.INSERT, DynamoStreamTypes.MODIFY],
          entityType: [
            Entities.LOGIN_EVENT,
            Entities.LOGIN_LINK,
            Entities.APPLICANT,
            Entities.ORG_INVITE,
          ],
        },
      },
    });

    new Rule(this, Rules.DeleteChildren, {
      eventBus: bus,
      description: 'Rule for deleting any child items.',
      ruleName: Rules.DeleteChildren,
      targets: [new SfnStateMachine(props.DeleteChildrenMachine)],
      eventPattern: {
        source: [Source.DynamoStream],
        detail: {
          eventName: [DynamoStreamTypes.REMOVE],
          entityType: Object.values(Entities),
        },
      },
    });

    // All applicant events are sent to the state machine
    new Rule(this, Rules.ApplicantEventsRule, {
      eventBus: bus,
      description: 'All applicant events are sent to the webhooks machine',
      ruleName: Rules.ApplicantEventsRule,
      targets: [new SfnStateMachine(props.WebhooksMachine)],
      eventPattern: {
        source: [Source.DynamoStream],
        detail: {
          eventName: Object.values(DynamoStreamTypes),
          entityType: [Entities.APPLICANT],
        },
      },
    });
  }
}
