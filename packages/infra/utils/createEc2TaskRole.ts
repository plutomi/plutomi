import { type IRole, Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import type { Stack } from "aws-cdk-lib";

type CreateEc2TaskRoleProps = {
  stack: Stack;
};

const roleName = "plutomi-ec2-role";

export const createEc2TaskRole = ({ stack }: CreateEc2TaskRoleProps): IRole => {
  const taskRole = new Role(stack, roleName, {
    roleName,
    assumedBy: new ServicePrincipal("ecs-tasks.amazonaws.com")
  });

  return taskRole;
};
