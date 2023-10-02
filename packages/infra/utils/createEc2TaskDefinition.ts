import {
  AwsLogDriver,
  ContainerImage,
  Ec2TaskDefinition,
  FargateTaskDefinition
} from "aws-cdk-lib/aws-ecs";
import { Role, type IRole, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { Duration, type Stack } from "aws-cdk-lib";
import { RetentionDays } from "aws-cdk-lib/aws-logs";
import { env } from "./env";
import {
  CONTAINER_CPU,
  CONTAINER_MEMORY_LIMIT,
  HEALTH_CHECK_PATH,
  HEALTH_CHECK_THRESHOLD_SECONDS
} from "./config";

type CreateEc2TaskDefinitionProps = {
  stack: Stack;
};

const taskDefinitionName = "plutomi-task-definition";
const containerName = "plutomi-container";
const LOG_STREAM_PREFIX = "plutomi-logs";
const roleName = "plutomi-ec2-role";

export const createEc2TaskDefinition = ({
  stack
}: CreateEc2TaskDefinitionProps): Ec2TaskDefinition => {
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
        // TODO Add name?
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
      retries: 2
    }
    // This is a hard limit, use the other one as its a soft limit
    // memoryLimitMiB: CONTAINER_MEMORY_LIMIT
  });

  return taskDefinition;
};
