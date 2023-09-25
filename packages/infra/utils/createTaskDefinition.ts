import {
  AwsLogDriver,
  ContainerImage,
  FargateTaskDefinition
} from "aws-cdk-lib/aws-ecs";
import { ServicePrincipal, type IRole, Role } from "aws-cdk-lib/aws-iam";
import { type Stack } from "aws-cdk-lib";
import { RetentionDays } from "aws-cdk-lib/aws-logs";
import { env } from "./env";

type CreateTaskDefinitionProps = {
  stack: Stack;
};

const taskDefinitionName = "plutomi-task-definition";
const containerName = "plutomi-container";
const logStreamPrefix = "plutomi-logs";
const roleName = "plutomi-ec2-role";

export const createTaskDefinition = ({
  stack
}: CreateTaskDefinitionProps): FargateTaskDefinition => {
  const taskRole = new Role(stack, roleName, {
    roleName,
    assumedBy: new ServicePrincipal("ecs-tasks.amazonaws.com")
  });

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
      streamPrefix: logStreamPrefix,
      logRetention: RetentionDays.ONE_WEEK
    }),
    environment: env as unknown as Record<string, string>
  });

  return taskDefinition;
};
