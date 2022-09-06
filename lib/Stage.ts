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

// TODO stagename type
export default class PipelineStage extends cdk.Stage {
  constructor(scope: Construct, stageName: 'staging' | 'production', props?: cdk.StageProps) {
    super(scope, stageName, props);

    // const appStack = new AppStack(this, `${stageName}-AppStack`);
    const { table } = new DynamoDBStack(this, `DynamoDBStack`);
    const storageStack = new StorageStack(this, `StorageStack`);
    const streamProcessorStack = new StreamProcessorStack(this, `SteamProcessorStack`, { table });

    const { DeleteChildrenMachine } = new DeleteChildrenMachineStack(
      this,
      `DeleteChildrenMachineStack`,
      {
        table,
      },
    );

    const { WebhooksMachine } = new WebhooksMachineStack(this, `WebhooksMachineStack`, {
      table,
    });
    //
    const eventBridgeStack = new EventBridgeStack(this, `EventBridgeStack`, {
      WebhooksMachine,
      DeleteChildrenMachine,
    });

    const appStack = new AppStack(this, `AppStack`, {
      table,
      stageName,
    });
  }
}
