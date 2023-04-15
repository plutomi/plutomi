import type { Cluster, FargateTaskDefinition } from "aws-cdk-lib/aws-ecs";
import type { ICertificate } from "aws-cdk-lib/aws-certificatemanager";
import type { Stack } from "aws-cdk-lib";
import { ApplicationLoadBalancedFargateService } from "aws-cdk-lib/aws-ecs-patterns";
import { createDeregistrationDelay } from "./createDeregistrationDelay";
import { createHealthChecks } from "./createHealthChecks";
import { createScalingPolicy } from "./createScalingPolicy";

type CreateFargateServiceProps = {
  stack: Stack;
  cluster: Cluster;
  taskDefinition: FargateTaskDefinition;
  certificate: ICertificate;
};

export const createFargateService = ({
  stack,
  cluster,
  taskDefinition,
  certificate
}: CreateFargateServiceProps): ApplicationLoadBalancedFargateService => {
  const fargateService = new ApplicationLoadBalancedFargateService(
    stack,
    "PlutomiService",
    {
      cluster,
      certificate,
      taskDefinition,
      desiredCount: 1,
      listenerPort: 443,
      redirectHTTP: true
    }
  );

  // Other Config
  createDeregistrationDelay({ fargateService });
  createHealthChecks({ fargateService });
  createScalingPolicy({ fargateService });

  return fargateService;
};
