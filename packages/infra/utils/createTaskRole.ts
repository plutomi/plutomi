import {
  type IRole,
  Role,
  ServicePrincipal,
  type Policy
} from "aws-cdk-lib/aws-iam";
import type { Stack } from "aws-cdk-lib";
import { env } from "./env";

type CreateTaskRoleProps = {
  stack: Stack;
  SESPolicy: Policy;
};

const roleName = `${env.DEPLOYMENT_ENVIRONMENT}-plutomi-fargate-role`;

export const createTaskRole = ({
  stack,
  SESPolicy
}: CreateTaskRoleProps): IRole => {
  const taskRole = new Role(stack, roleName, {
    roleName,
    assumedBy: new ServicePrincipal("ecs-tasks.amazonaws.com")
  });

  taskRole.attachInlinePolicy(SESPolicy);
  return taskRole;
};
