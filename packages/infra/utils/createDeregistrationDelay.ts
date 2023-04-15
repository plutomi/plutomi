import type { ApplicationLoadBalancedFargateService } from "aws-cdk-lib/aws-ecs-patterns";

type CreateDeregistrationDelayProps = {
  fargateService: ApplicationLoadBalancedFargateService;
};

export const createDeregistrationDelay = ({
  fargateService
}: CreateDeregistrationDelayProps): void => {
  const deregistrationDelay = 5;
  fargateService.targetGroup.setAttribute(
    "deregistration_delay.timeout_seconds",
    deregistrationDelay.toString()
  );
};
