import { Cluster, type FargateTaskDefinition } from "aws-cdk-lib/aws-ecs";
import type { ICertificate } from "aws-cdk-lib/aws-certificatemanager";
import type { FckNatInstanceProvider } from "cdk-fck-nat";
import { Port, type Vpc } from "aws-cdk-lib/aws-ec2";
import { Duration, type Stack } from "aws-cdk-lib";
import {
  ApplicationLoadBalancedEc2Service,
  ApplicationLoadBalancedFargateService
} from "aws-cdk-lib/aws-ecs-patterns";
import { AdjustmentType } from "aws-cdk-lib/aws-applicationautoscaling";
import { Metric } from "aws-cdk-lib/aws-cloudwatch";

type CreateEc2ServiceProps = {
  stack: Stack;
  taskDefinition: FargateTaskDefinition;
  certificate: ICertificate;
  cluster: Cluster;
  natGatewayProvider: FckNatInstanceProvider;
};

const serviceName = "plutomi-service";
const loadBalancerName = "plutomi-load-balancer";

export const createEc2Service = ({
  stack,
  taskDefinition,
  certificate,
  cluster,
  natGatewayProvider
}: CreateEc2ServiceProps): ApplicationLoadBalancedEc2Service => {
  const ec2Service = new ApplicationLoadBalancedEc2Service(stack, serviceName, {
    cluster,
    certificate,
    taskDefinition,
    // The load balancer will be public, but our tasks will not.
    // Outbound traffic for the tasks will be provided by the NAT Gateway
    // assignPublicIp: false,
    publicLoadBalancer: true,
    // taskSubnets: {
    //   // Ensure private subnets are used for tasks
    //   subnets: vpc.privateSubnets
    // },
    desiredCount: 1,
    serviceName,
    loadBalancerName
  });

  const deregistrationDelaySeconds = 5;
  ec2Service.targetGroup.setAttribute(
    "deregistration_delay.timeout_seconds",
    deregistrationDelaySeconds.toString()
  );

  // Health Checks
  ec2Service.targetGroup.configureHealthCheck({
    interval: Duration.seconds(5),
    healthyThresholdCount: 2,
    unhealthyThresholdCount: 2,
    timeout: Duration.seconds(4),
    path: "/api/health"
  });

  const ports = [
    // Outbound HTTPS from tasks
    443,
    //  Outbound MongoDB from tasks - TODO Replace with Private Link in the future
    27017
  ];

  ports.forEach((port) => {
    natGatewayProvider.connections.allowFrom(
      ec2Service.service,
      Port.tcp(port)
    );
  });

  return ec2Service;
  //   const fargateService = new ApplicationLoadBalancedFargateService(
  //     stack,
  //     serviceName,

  //   );

  //   // How long it takes to kill a container
  //   // https://twitter.com/pahudnet/status/1185232660081197056

  //   // Scaling
  //   const scalingPeriodInSeconds = 60;
  //   const evaluationPeriods = 1;
  //   const DESIRED_RPS_PER_SERVER = 25;

  //   const scaling = fargateService.service.autoScaleTaskCount({
  //     minCapacity: 1,
  //     // Be aware of the connection pooling settings when changing this value
  //     maxCapacity: 10
  //   });

  //   // scaling.scaleOnRequestCount("RPS-Scale-Up-Policy", {
  //   //   requestsPerTarget: DESIRED_RPS_PER_SERVER,
  //   //   targetGroup: fargateService.targetGroup,
  //   //   policyName: "RPS-Scale-Up-Policy",
  //   //   scaleOutCooldown: Duration.seconds(30),
  //   //   scaleInCooldown: Duration.seconds(180)
  //   // });

  //   //   Get the total requests in a 10 second period
  //   const requestsPerMinuteMetric = new Metric({
  //     namespace: "AWS/ApplicationELB",
  //     metricName: "RequestCountPerTarget",
  //     statistic: "Sum",
  //     period: Duration.seconds(scalingPeriodInSeconds),
  //     dimensionsMap: {
  //       // Tells CW which LB and Target Group to get metrics from
  //       TargetGroup: fargateService.targetGroup.targetGroupFullName,
  //       LoadBalancer: fargateService.loadBalancer.loadBalancerFullName
  //     }
  //   });

  //   scaling.scaleOnMetric("RPS-Scale-Up-Policy", {
  //     evaluationPeriods,
  //     metric: requestsPerMinuteMetric,
  //     scalingSteps: [
  //       {
  //         lower: DESIRED_RPS_PER_SERVER * scalingPeriodInSeconds,
  //         change: 2
  //       },
  //       {
  //         lower:
  //           DESIRED_RPS_PER_SERVER *
  //           scalingPeriodInSeconds *
  //           // Spike
  //           2,
  //         change: 3
  //       }
  //     ],
  //     adjustmentType: AdjustmentType.CHANGE_IN_CAPACITY
  //   });

  //   scaling.scaleOnMetric("RPS-Scale-Down-Policy", {
  //     evaluationPeriods: 18,
  //     metric: requestsPerMinuteMetric,
  //     scalingSteps: [
  //       {
  //         /**
  //          * TLDR:
  //          * Traffic dropped by 30% for 3 minutes straight -> Scale Down by 1
  //          * Traffic dropped by 70% for 3 minutes straight -> Scale Down by 3
  //          *
  //          * "RequestCountPerTarget <= 1050 for 18 datapoints (every 10 seconds) within 3 minutes"
  //          */
  //         upper:
  //           Math.floor(DESIRED_RPS_PER_SERVER * 0.7) * scalingPeriodInSeconds,
  //         change: -1
  //       },
  //       {
  //         upper:
  //           Math.floor(DESIRED_RPS_PER_SERVER * 0.3) * scalingPeriodInSeconds,
  //         change: -2
  //       }
  //     ], // Note that this is a percentage change
  //     adjustmentType: AdjustmentType.CHANGE_IN_CAPACITY
  //   });

  //   // Allow outbound traffic from tasks to the internet

  //   return fargateService;
};
