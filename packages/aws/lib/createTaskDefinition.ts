import {
  AwsLogDriver,
  ContainerImage,
  FargateTaskDefinition,
} from "aws-cdk-lib/aws-ecs";
import type { IRole } from "aws-cdk-lib/aws-iam";
import { type Stack } from "aws-cdk-lib";
import { RetentionDays } from "aws-cdk-lib/aws-logs";

type CreateTaskDefinitionProps = {
  stack: Stack;
  taskRole: IRole;
};

const taskDefinitionName = "plutomi-task-definition";
const logStreamPrefix = "plutomi-logs";

export const createTaskDefinition = ({
  stack,
  taskRole,
}: CreateTaskDefinitionProps): FargateTaskDefinition => {
  // Create a task definition we can attach policies to
  const taskDefinition = new FargateTaskDefinition(stack, taskDefinitionName, {
    taskRole,
    executionRole: taskRole,
    cpu: 256,
    memoryLimitMiB: 512,
  });

  const containers: {
    containerName: string;
    imageDirectory: string;
    containerPort: number;
  }[] = [
    {
      containerName: "plutomi-web-container",
      imageDirectory: "../../packages/web",
      containerPort: 3000,
    },
    {
      containerName: "plutomi-api-container",
      imageDirectory: "../../packages/api",
      containerPort: 8080,
    },
  ];

  containers.forEach(({ containerName, containerPort, imageDirectory }) => {
    taskDefinition.addContainer(containerName, {
      portMappings: [
        {
          containerPort: containerPort,
        },
      ],
      image: ContainerImage.fromAsset(imageDirectory, {
        // Get the NextJS docker image, build it, and push it to ECR
      }),

      logging: new AwsLogDriver({
        streamPrefix: logStreamPrefix,
        logRetention: RetentionDays.ONE_WEEK,
      }),
      environment: {} as unknown as Record<string, string>,
    });
  });

  return taskDefinition;
};
