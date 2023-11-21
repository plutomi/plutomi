import { type IRole, Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import type { Stack } from "aws-cdk-lib";

type CreateTaskRoleProps = {
  stack: Stack;
};

const roleName = "plutomi-fargate-role";

export const createTaskRole = ({ stack }: CreateTaskRoleProps): IRole => {
  const taskRole = new Role(stack, roleName, {
    roleName,
    assumedBy: new ServicePrincipal("ecs-tasks.amazonaws.com"),
  });

  return taskRole;
};
