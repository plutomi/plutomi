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

const taskDefinitionName = `${env.DEPLOYMENT_ENVIRONMENT}-plutomi-task-definition`;
const containerName = `${env.DEPLOYMENT_ENVIRONMENT}-plutomi-container`;
const logStreamPrefix = `${env.DEPLOYMENT_ENVIRONMENT}-plutomi-logs`;

export const createTaskDefinition = ({
  stack,
  taskRole
}: CreateTaskDefinitionProps): FargateTaskDefinition => {
  // Create a task definition we can attach policies to
  const taskDefinition = new FargateTaskDefinition(stack, taskDefinitionName, {
    taskRole,
    executionRole: taskRole,
    cpu: 256,
    memoryLimitMiB: 512
  });

  taskDefinition.addContainer(containerName, {
    portMappings: [
      {
        containerPort: Number(env.PORT)
      }
    ],
    image: ContainerImage.fromAsset("../../", {
      // Get the local docker image (@root), build and deploy it
      // ! Must match the ARGs in the docker file for NextJS!
      buildArgs: {
        NEXT_PUBLIC_BASE_URL: env.NEXT_PUBLIC_BASE_URL
      }
    }),

    logging: new AwsLogDriver({
      streamPrefix: logStreamPrefix
    }),
    environment: env as unknown as Record<string, string>
  });

  return taskDefinition;
};
