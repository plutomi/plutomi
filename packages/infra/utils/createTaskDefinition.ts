import { FargateTaskDefinition } from "aws-cdk-lib/aws-ecs";
import type { IRole } from "aws-cdk-lib/aws-iam";
import type { Stack } from "aws-cdk-lib";

type CreateTaskDefinitionProps = {
  stack: Stack;
  taskRole: IRole;
};

export const createTaskDefinition = ({
  stack,
  taskRole
}: CreateTaskDefinitionProps): FargateTaskDefinition => {
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
  return taskDefinition;
};
