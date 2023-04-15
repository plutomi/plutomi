import type { Cluster, FargateTaskDefinition } from "aws-cdk-lib/aws-ecs";
import type { Construct } from "constructs";
import type { ICertificate } from "aws-cdk-lib/aws-certificatemanager";
import { ApplicationLoadBalancedFargateService } from "aws-cdk-lib/aws-ecs-patterns";
import { createDeregistrationDelay } from "./utils/createDeregistrationDelay";
import { createHealthChecks } from "./utils/createHealthChecks";
import { createScalingPolicy } from "./utils/createScalingPolicy";

type CreateFargateServiceProps = {
  construct: Construct;
  cluster: Cluster;
  taskDefinition: FargateTaskDefinition;
  certificate: ICertificate;
};

export const createFargateService = ({
  construct,
  cluster,
  taskDefinition,
  certificate
}: CreateFargateServiceProps): ApplicationLoadBalancedFargateService => {
  const fargateService = new ApplicationLoadBalancedFargateService(
    construct,
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
