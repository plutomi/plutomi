import { type IRole, Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import type { Stack } from "aws-cdk-lib";

type CreateTaskRoleProps = {
  stack: Stack;
};

export const createTaskRole = ({ stack }: CreateTaskRoleProps): IRole => {
  const taskRole = new Role(stack, "plutomi-api-fargate-role", {
    assumedBy: new ServicePrincipal("ecs-tasks.amazonaws.com")
  });

  return taskRole;
};
