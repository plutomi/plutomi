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
  NeedsComms = 'NeedsCommsRule',
  DeleteChildren = 'DeleteChildrenRule',
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
      retention: cdk.Duration.days(3),
    });
    // We want to send all communication events to the step function, we can handle routing there
    new Rule(this, Rules.NeedsComms, {
      eventBus: bus,
      description:
        'Rule that checks if an action needs further comms such as login links or welcome emails. Forwards to the `CommsMachine` step function.',
      ruleName: Rules.NeedsComms,
      targets: [new SfnStateMachine(props.CommsMachine)],
      eventPattern: {
        source: [Source.DynamoStream],
        detail: {
          eventName: [DynamoStreamTypes.INSERT],
          entityType: [
            Entities.LOGIN_EVENT,
            Entities.LOGIN_LINK,
            Entities.APPLICANT, // TODO
            Entities.ORG_INVITE,
          ],
        },
      },
    });

    // We want to send all deletion events to the step function, we can handle routing there
    new Rule(this, Rules.DeleteChildren, {
      eventBus: bus,
      description:
        'Rule that checks if an action needs further comms such as login links or welcome emails. Forwards to the `CommsMachine` step function.',
      ruleName: Rules.DeleteChildren,
      targets: [new SfnStateMachine(props.DeleteChildrenMachine)],
      eventPattern: {
        source: [Source.DynamoStream],
        detail: {
          eventName: [DynamoStreamTypes.REMOVE],
          entityType: [
            // TODO also applicants and their files
            Entities.ORG,
            Entities.OPENING,
            Entities.QUESTION,
            Entities.WEBHOOK,
          ],
        },
      },
    });

    // All applicant events are sent to the state machine
    new Rule(this, 'ApplicantWebhooksRule', {
      eventBus: bus,
      description: 'All applicant events are sent to the webhooks machine',
      ruleName: 'WebhooksRule',
      targets: [new SfnStateMachine(props.WebhooksMachine)],
      eventPattern: {
        source: ['dynamodb.streams'],
        detail: {
          eventName: Object.values(DynamoStreamTypes),
          entityType: [Entities.APPLICANT],
        },
      },
    });
  }
}
