import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { configureEmails } from "./configureEmails";
import { createVpc } from "./createVpc";
import { createTaskRole } from "./createTaskRole";
import { createTaskDefinition } from "./createTaskDefinition";
import { createFargateService } from "./createFargateService";
import { env } from "../utils/env";
import { createEventBus } from "./createEventBus";
import { createEventsConsumer } from "./createPlutomiEventsConsumer";
import { createEmailEventsConsumer } from "./createEmailEventsConsumer";
import { disableCloudWatchLogging } from "./disableLogging";

export class PlutomiStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const eventBus = createEventBus({ stack: this });

    const { emailEventsConsumer, configurationSet } = createEmailEventsConsumer(
      {
        stack: this,
        eventBus,
      }
    );

    configureEmails({
      stack: this,
      configurationSet,
    });

    const { vpc, natGatewayProvider } = createVpc({ stack: this });
    const taskRole = createTaskRole({ stack: this });
    const taskDefinition = createTaskDefinition({ stack: this, taskRole });

    const plutomiEventsConsumer = createEventsConsumer({
      stack: this,
      eventBus,
    });

    const fargateService = createFargateService({
      stack: this,
      taskDefinition,
      vpc,
      natGatewayProvider,
      eventBus,
    });

    // TEmp disabling for rust testing
    // disableCloudWatchLogging({
    //   fargateService,
    //   emailEventsConsumer,
    //   plutomiEventsConsumer,
    // });
  }
}
