import type { FargateTaskDefinition } from "aws-cdk-lib/aws-ecs";
import type { ICertificate } from "aws-cdk-lib/aws-certificatemanager";
import type { FckNatInstanceProvider } from "cdk-fck-nat";
import { Port, type Vpc } from "aws-cdk-lib/aws-ec2";
import { Duration, type Stack } from "aws-cdk-lib";
import { ApplicationLoadBalancedFargateService } from "aws-cdk-lib/aws-ecs-patterns";

type CreateFargateServiceProps = {
  stack: Stack;
  taskDefinition: FargateTaskDefinition;
  certificate: ICertificate;
  vpc: Vpc;
  natGatewayProvider: FckNatInstanceProvider;
};

export const createFargateService = ({
  stack,
  taskDefinition,
  certificate,
  vpc,
  natGatewayProvider
}: CreateFargateServiceProps): ApplicationLoadBalancedFargateService => {
  const fargateService = new ApplicationLoadBalancedFargateService(
    stack,
    "PlutomiService",
    {
      vpc,
      certificate,
      taskDefinition,
      // The load balancer will be public, but our tasks will not.
      // Outbound traffic for the tasks will be provided by the NAT Gateway
      assignPublicIp: false,
      publicLoadBalancer: true,
      taskSubnets: {
        // Ensure private subnets are used for tasks
        subnets: vpc.privateSubnets
      },
      desiredCount: 1,
      serviceName: "plutomi-app",
      loadBalancerName: "plutomi-load-balancer"
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
    requestsPerTarget: 50,
    targetGroup: fargateService.targetGroup,
    scaleInCooldown: Duration.seconds(60),
    scaleOutCooldown: Duration.seconds(60)
  });

  // TODO: Remove one of these
  // Allows our servers to connect to the nat gateways
  fargateService.service.connections.securityGroups.forEach((sg) => {
    // natGatewayProvider.securityGroup.addIngressRule(sg, Port.tcp(443));
    natGatewayProvider.securityGroup.addIngressRule(sg, Port.tcp(80));
  });

  return fargateService;
};
