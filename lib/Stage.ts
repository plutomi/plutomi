import { EventBridge } from '@aws-sdk/client-eventbridge';
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import AppStack from './AppStack';
import DeleteChildrenMachineStack from './DeleteChildrenMachineStack';
import DynamoDBStack from './DynamoDBStack';
import EventBridgeStack from './EventBridgeStack';
import StorageStack from './StorageStack';
import StreamProcessorStack from './StreamProcessorStack';
import WebhooksMachineStack from './WebhooksMachineStack';
import WebhooksMachine from './WebhooksMachineStack';

export default class PipelineStage extends cdk.Stage {
  constructor(scope: Construct, stageName: string, props?: cdk.StageProps) {
    super(scope, stageName, props);

    // const appStack = new AppStack(this, `${stageName}-AppStack`);
    const { table } = new DynamoDBStack(this, `${stageName}-DynamoDBStack`);
    const storageStack = new StorageStack(this, `${stageName}-StorageStack`);
    const streamProcessorStack = new StreamProcessorStack(
      this,
      `${stageName}-SteamProcessorStack`,
      { table },
    );

    const { DeleteChildrenMachine } = new DeleteChildrenMachineStack(
      this,
      `${stageName}-DeleteChildrenMachineStack`,
      {
        table,
      },
    );

    const { WebhooksMachine } = new WebhooksMachineStack(
      this,
      `${stageName}-WebhooksMachineStack`,
      {
        table,
      },
    );

    const eventBridgeStack = new EventBridgeStack(this, `${stageName}-EventBridgeStack`, {
      WebhooksMachine,
      DeleteChildrenMachine,
    });
  }
}
