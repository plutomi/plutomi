import type { Cluster, FargateTaskDefinition } from "aws-cdk-lib/aws-ecs";
import type { Construct } from "constructs";
import type { Certificate } from "aws-cdk-lib/aws-certificatemanager";
import { ApplicationLoadBalancedFargateService } from "aws-cdk-lib/aws-ecs-patterns";

type CreateFargateServiceProps = {
  construct: Construct;
  cluster: Cluster;
  taskDefinition: FargateTaskDefinition;
  certificate: Certificate;
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

  return fargateService;
};
