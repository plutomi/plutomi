import {
  AwsLogDriver,
  ContainerImage,
  FargateTaskDefinition
} from "aws-cdk-lib/aws-ecs";
import type { IRole } from "aws-cdk-lib/aws-iam";
import type { Stack } from "aws-cdk-lib";
import { env } from "../env";

type CreateTaskDefinitionProps = {
  stack: Stack;
  taskRole: IRole;
};

export const createTaskDefinition = ({
  stack,
  taskRole
}: CreateTaskDefinitionProps): FargateTaskDefinition => {
  // Create a task definition we can attach policies to
  const taskDefinition = new FargateTaskDefinition(
    stack,
    "plutomi-api-fargate-task-definition",
    {
      taskRole,
      executionRole: taskRole,
      cpu: 256,
      memoryLimitMiB: 512
    }
  );

  const container = taskDefinition.addContainer(
    "plutomi-api-fargate-container",
    {
      image: ContainerImage.fromAsset("../../", {
        // Get the local docker image (@root), build and deploy it
        // ! Must match the ARGs in the docker file for NextJS!
        buildArgs: {
          NEXT_PUBLIC_BASE_URL: env.NEXT_PUBLIC_BASE_URL
        }
      }),

      logging: new AwsLogDriver({
        streamPrefix: "plutomi-api-fargate"
      }),
      environment: env as unknown as Record<string, string>
    }
  );

  // Add the port mapping to our containers
  container.addPortMappings({
    containerPort: env.PORT,
    hostPort: env.PORT
  });

  return taskDefinition;
};
