import { type FargateTaskDefinition } from "aws-cdk-lib/aws-ecs";
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

const serviceName = "plutomi-service";
const loadBalancerName = "plutomi-load-balancer";

export const createFargateService = ({
  stack,
  taskDefinition,
  certificate,
  vpc,
  natGatewayProvider
}: CreateFargateServiceProps): ApplicationLoadBalancedFargateService => {
  const fargateService = new ApplicationLoadBalancedFargateService(
    stack,
    serviceName,
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
      serviceName,
      loadBalancerName
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

  // Scaling
  // const scalingPeriodInSeconds = 10;
  // const evaluationPeriods = 3;
  const DESIRED_RPS_PER_SERVER = 75;

  const scaling = fargateService.service.autoScaleTaskCount({
    minCapacity: 1,
    // Be aware of the connection pooling settings when changing this value
    maxCapacity: 10
  });

  scaling.scaleOnRequestCount("RPS-Scale-Up-Policy", {
    requestsPerTarget: DESIRED_RPS_PER_SERVER,
    targetGroup: fargateService.targetGroup,
    policyName: "RPS-Scale-Up-Policy",
    scaleOutCooldown: Duration.seconds(30),
    scaleInCooldown: Duration.seconds(180)
  });

  // //  Get the total requests in a 10 second period
  // const requestPerSecondMetric = new Metric({
  //   namespace: "AWS/ApplicationELB",
  //   metricName: "RequestCountPerTarget",
  //   statistic: "Sum",
  //   period: Duration.seconds(scalingPeriodInSeconds),
  //   dimensionsMap: {
  //     // Tells CW which LB and Target Group to get metrics from
  //     TargetGroup: fargateService.targetGroup.targetGroupFullName,
  //     LoadBalancer: fargateService.loadBalancer.loadBalancerFullName
  //   }
  // });

  // scaling.scaleOnMetric("RPS-Scale-Up-Policy", {
  //   /**
  //    * TLDR:
  //    * 50 RPS for 30 seconds straight -> Scale Up by 1
  //    * 100 RPS for 30 seconds straight -> Scale Up by 3
  //    * "RequestCountPerTarget >= 1500 for 3 datapoints (every 10 seconds) within 30 seconds"
  //    *
  //    */
  //   evaluationPeriods,
  //   metric: requestPerSecondMetric,
  //   scalingSteps: [
  //     {
  //       lower:
  //         DESIRED_RPS_PER_SERVER * scalingPeriodInSeconds * evaluationPeriods,
  //       change: 1
  //     },
  //     {
  //       lower:
  //         DESIRED_RPS_PER_SERVER *
  //         scalingPeriodInSeconds *
  //         evaluationPeriods *
  //         // Spike
  //         2,
  //       change: 3
  //     }
  //   ],
  //   adjustmentType: AdjustmentType.CHANGE_IN_CAPACITY
  // });

  // scaling.scaleOnMetric("RPS-Scale-Down-Policy", {
  //   evaluationPeriods: 18,
  //   metric: requestPerSecondMetric,
  //   scalingSteps: [
  //     {
  //       /**
  //        * TLDR:
  //        * Traffic dropped by 30% for 3 minutes straight -> Scale Down by 1
  //        * Traffic dropped by 70% for 3 minutes straight -> Scale Down by 3
  //        *
  //        * "RequestCountPerTarget <= 1050 for 18 datapoints (every 10 seconds) within 3 minutes"
  //        */
  //       upper:
  //         Math.floor(DESIRED_RPS_PER_SERVER * 0.7) *
  //         scalingPeriodInSeconds *
  //         evaluationPeriods,
  //       change: -1
  //     },
  //     {
  //       upper:
  //         Math.floor(DESIRED_RPS_PER_SERVER * 0.3) *
  //         scalingPeriodInSeconds *
  //         evaluationPeriods,
  //       change: -3
  //     }
  //   ], // Note that this is a percentage change
  //   adjustmentType: AdjustmentType.CHANGE_IN_CAPACITY
  // });

  const ports = [
    // Outbound HTTPS from tasks
    443,
    // Outbound MongoDB from tasks
    27017
  ];

  // Allow outbound traffic from tasks to the internet
  // TODO: Mongo PrivateLink
  ports.forEach((port) => {
    natGatewayProvider.connections.allowFrom(
      fargateService.service,
      Port.tcp(port)
    );
  });

  return fargateService;
};
