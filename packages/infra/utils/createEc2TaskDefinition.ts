import {
  AwsLogDriver,
  ContainerImage,
  Ec2TaskDefinition,
  FargateTaskDefinition
} from "aws-cdk-lib/aws-ecs";
import type { IRole } from "aws-cdk-lib/aws-iam";
import { type Stack } from "aws-cdk-lib";
import { RetentionDays } from "aws-cdk-lib/aws-logs";
import { env } from "./env";
import { CONTAINER_CPU, CONTAINER_MEMORY_LIMIT } from "./config";

type CreateEc2TaskDefinitionProps = {
  stack: Stack;
  taskRole: IRole;
};

const taskDefinitionName = "plutomi-task-definition";
const containerName = "plutomi-container";
const logStreamPrefix = "plutomi-logs";

export const createEc2TaskDefinition = ({
  stack,
  taskRole
}: CreateEc2TaskDefinitionProps): Ec2TaskDefinition => {
  // Create a task definition we can attach policies to
  const taskDefinition = new Ec2TaskDefinition(stack, taskDefinitionName, {
    taskRole,
    executionRole: taskRole
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
      streamPrefix: logStreamPrefix,
      logRetention: RetentionDays.ONE_WEEK
    }),
    environment: env as unknown as Record<string, string>,
    cpu: CONTAINER_CPU,
    memoryLimitMiB: CONTAINER_MEMORY_LIMIT
  });

  return taskDefinition;
};
