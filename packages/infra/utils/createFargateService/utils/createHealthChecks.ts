import { Duration } from "aws-cdk-lib";
import type { ApplicationLoadBalancedFargateService } from "aws-cdk-lib/aws-ecs-patterns";

type CreateHealthChecksProps = {
  fargateService: ApplicationLoadBalancedFargateService;
};

export const createHealthChecks = ({
  fargateService
}: CreateHealthChecksProps): void => {
  fargateService.targetGroup.configureHealthCheck({
    interval: Duration.seconds(5),
    healthyThresholdCount: 2,
    unhealthyThresholdCount: 2,
    timeout: Duration.seconds(5),
    path: "/api/health"
  });
};
