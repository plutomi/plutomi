import { type IRole, Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import type { Construct } from "constructs";

type CreateTaskRoleProps = {
  construct: Construct;
};

export const createTaskRole = ({ construct }: CreateTaskRoleProps): IRole => {
  // IAM inline role - the service principal is required
  const taskRole = new Role(construct, "plutomi-api-fargate-role", {
    assumedBy: new ServicePrincipal("ecs-tasks.amazonaws.com")
  });

  return taskRole;
};
