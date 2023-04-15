import { FargateTaskDefinition } from "aws-cdk-lib/aws-ecs";
import type { IRole } from "aws-cdk-lib/aws-iam";
import type { Construct } from "constructs";

type CreateTaskDefinitionProps = {
  construct: Construct;
  taskRole: IRole;
};

export const createTaskDefinition = ({
  construct,
  taskRole
}: CreateTaskDefinitionProps): FargateTaskDefinition => {
  const taskDefinition = new FargateTaskDefinition(
    construct,
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
