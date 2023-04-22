import type { Cluster, FargateTaskDefinition } from "aws-cdk-lib/aws-ecs";
import type { ICertificate } from "aws-cdk-lib/aws-certificatemanager";
import { Duration, type Stack } from "aws-cdk-lib";
import { ApplicationLoadBalancedFargateService } from "aws-cdk-lib/aws-ecs-patterns";

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

  // How long it takes to kill a container
  // https://twitter.com/pahudnet/status/1185232660081197056
  const deregistrationDelaySeconds = 5;
  fargateService.targetGroup.setAttribute(
    "deregistration_delay.timeout_seconds",
    deregistrationDelaySeconds.toString()
  );

  // Health Checks
  fargateService.targetGroup.configureHealthCheck({
    interval: Duration.seconds(5),
    healthyThresholdCount: 2,
    unhealthyThresholdCount: 2,
    timeout: Duration.seconds(4),
    path: "/api/health"
  });

  // Scaling - based on RPS
  const scaling = fargateService.service.autoScaleTaskCount({
    minCapacity: 1,
    maxCapacity: 4
  });

  scaling.scaleOnRequestCount("plutomi-request-scaling", {
    requestsPerTarget: 100,
    targetGroup: fargateService.targetGroup,
    scaleInCooldown: Duration.seconds(60),
    scaleOutCooldown: Duration.seconds(60)
  });
  scaling.scaleOnCpuUtilization("CpuScaling", {
    targetUtilizationPercent: 50,
    scaleInCooldown: Duration.seconds(60),
    scaleOutCooldown: Duration.seconds(60)
  });

  return fargateService;
};
