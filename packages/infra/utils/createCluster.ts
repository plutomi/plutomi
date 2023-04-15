import type { Stack } from "aws-cdk-lib";
import type { Vpc } from "aws-cdk-lib/aws-ec2";
import { Cluster } from "aws-cdk-lib/aws-ecs";

type CreateClusterProps = {
  stack: Stack;
  vpc: Vpc;
};

export const createCluster = ({ stack, vpc }: CreateClusterProps): Cluster => {
  const cluster = new Cluster(stack, "plutomi-api-fargate-cluster", {
    vpc
  });

  return cluster;
};
