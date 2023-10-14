import {
  AwsLogDriver,
  ContainerImage,
  Ec2TaskDefinition
} from "aws-cdk-lib/aws-ecs";
import { Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { Duration, type Stack } from "aws-cdk-lib";
import { RetentionDays } from "aws-cdk-lib/aws-logs";
import { env } from "./env";
import {
  CONTAINER_CPU,
  CONTAINER_MEMORY_LIMIT,
  HEALTH_CHECK_PATH,
  HEALTH_CHECK_THRESHOLD_SECONDS
} from "./config";

type CreateTaskDefinitionProps = {
  stack: Stack;
};

const taskDefinitionName = "plutomi-task-definition";
const containerName = "plutomi-container";
const LOG_STREAM_PREFIX = "plutomi-logs";
const roleName = "plutomi-ec2-role";

export const createTaskDefinition = ({
  stack
}: CreateTaskDefinitionProps): Ec2TaskDefinition => {
  const taskRole = new Role(stack, roleName, {
    roleName,
    assumedBy: new ServicePrincipal("ecs-tasks.amazonaws.com")
  });

  // Create a task definition we can attach policies to
  const taskDefinition = new Ec2TaskDefinition(stack, taskDefinitionName, {
    taskRole,
    executionRole: taskRole
  });

  taskDefinition.addContainer(containerName, {
    portMappings: [
      {
        containerPort: Number(env.PORT)
        // Have dynamic host port so that we can run multiple instances on the same host
        // hostPort: Number(0)
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
      streamPrefix: LOG_STREAM_PREFIX,
      logRetention: RetentionDays.ONE_WEEK
    }),
    memoryReservationMiB: CONTAINER_MEMORY_LIMIT,
    environment: env as unknown as Record<string, string>,
    cpu: CONTAINER_CPU,
    healthCheck: {
      command: [
        "CMD-SHELL",
        `curl -f http://localhost:${env.PORT}${HEALTH_CHECK_PATH} || exit 1`
      ],
      interval: Duration.seconds(HEALTH_CHECK_THRESHOLD_SECONDS),
      // Ensure that this is long enough for startup (node running & any DB lookups)
      // If not, ECS will get stuck in an infinite loop :(
      startPeriod: Duration.seconds(HEALTH_CHECK_THRESHOLD_SECONDS * 3),
      retries: 3
    }
    // This is a hard limit (DO NOT USE) - use memoryReservationMiB instead as it is a soft limit
    // memoryLimitMiB: CONTAINER_MEMORY_LIMIT
  });

  return taskDefinition;
};
