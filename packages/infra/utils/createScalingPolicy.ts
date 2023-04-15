import { Duration } from "aws-cdk-lib";
import type { ApplicationLoadBalancedFargateService } from "aws-cdk-lib/aws-ecs-patterns";

type CreateScalingPolicyProps = {
  fargateService: ApplicationLoadBalancedFargateService;
};

export const createScalingPolicy = ({
  fargateService
}: CreateScalingPolicyProps): void => {
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
};
