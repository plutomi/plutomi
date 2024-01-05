import {
  AwsLogDriver,
  ContainerImage,
  CpuArchitecture,
  FargateTaskDefinition,
  OperatingSystemFamily,
  Protocol,
} from "aws-cdk-lib/aws-ecs";
import type { IRole } from "aws-cdk-lib/aws-iam";
import { type Stack } from "aws-cdk-lib";
import { RetentionDays } from "aws-cdk-lib/aws-logs";
import { env } from "../utils/env";

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
    runtimePlatform: {
      operatingSystemFamily: OperatingSystemFamily.LINUX,
      cpuArchitecture: CpuArchitecture.ARM64,
    },
  });

  const containers: {
    containerName: string;
    imageDirectory: string;
    containerPort: number;
    cpu: number;
    memoryReservationMiB: number;
    environment: Record<string, string>;
  }[] = [
    {
      containerName: "plutomi-web-container",
      imageDirectory: "../../packages/web",
      cpu: 100,
      memoryReservationMiB: 150,
      containerPort: 3000,
      environment: {
        // Make sure to update the Docker image with the latest env vars
        NEXT_PUBLIC_ENVIRONMENT: env.NEXT_PUBLIC_ENVIRONMENT,
        NEXT_PUBLIC_BASE_URL: env.NEXT_PUBLIC_BASE_URL,
        AXIOM_DATASET: env.AXIOM_DATASET,
        AXIOM_TOKEN: env.AXIOM_TOKEN,
        AXIOM_ORG_ID: env.AXIOM_ORG_ID,
      },
    },
    {
      containerName: "plutomi-api-container",
      imageDirectory: "../../packages/api",
      cpu: 140,
      memoryReservationMiB: 300,
      containerPort: 8080,
      environment: env,
    },
  ];

  containers.forEach(
    ({
      containerName,
      containerPort,
      imageDirectory,
      cpu,
      memoryReservationMiB,
      environment,
    }) => {
      taskDefinition.addContainer(containerName, {
        portMappings: [
          {
            containerPort,
            protocol: Protocol.TCP,
          },
        ],
        containerName,
        // cpu,
        // memoryReservationMiB,
        image: ContainerImage.fromAsset(imageDirectory, {
          // Get the NextJS docker image, build it, and push it to ECR
        }),

        logging: new AwsLogDriver({
          streamPrefix: logStreamPrefix,
          logRetention: RetentionDays.ONE_WEEK,
        }),
        // TODO Parameter store?
        environment,
      });
    }
  );

  return taskDefinition;
};
