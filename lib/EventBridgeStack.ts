import * as cdk from 'aws-cdk-lib';
import { EventBus, Rule } from 'aws-cdk-lib/aws-events';
import { StateMachine } from 'aws-cdk-lib/aws-stepfunctions';
import { SfnStateMachine } from 'aws-cdk-lib/aws-events-targets';
import { DynamoStreamTypes, Entities } from '../Config';
import { env } from '../env';

enum Rules {
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
  DynamoStream = 'dynamodb.streams',
}

interface EventBridgeStackProps extends cdk.StackProps {
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
    const bus = new EventBus(this, `${env.deploymentEnvironment}-EventBus`, {
      eventBusName: `${env.deploymentEnvironment}-EventBus`,
    });

    bus.archive(`${env.deploymentEnvironment}-EventArchive`, {
      archiveName: `${env.deploymentEnvironment}-EventArchive`,
      eventPattern: {
        account: [cdk.Stack.of(this).account],
      },
      retention: cdk.Duration.days(3),
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
        },
      },
    });

    new Rule(this, Rules.ApplicantEventsRule, {
      eventBus: bus,
      description: 'All applicant events are sent to the webhooks machine',
      ruleName: Rules.ApplicantEventsRule,
      targets: [new SfnStateMachine(props.WebhooksMachine)],
      eventPattern: {
        source: [Source.DynamoStream],
        detail: {
          entityType: [Entities.APPLICANT],
        },
      },
    });
  }
}
