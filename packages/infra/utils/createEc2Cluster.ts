import { Stack } from "aws-cdk-lib";
import {
  InstanceType,
  Vpc,
  InstanceClass,
  InstanceSize
} from "aws-cdk-lib/aws-ec2";
import { Cluster } from "aws-cdk-lib/aws-ecs";

type CreateEc2ClusterProps = {
  stack: Stack;
  vpc: Vpc;
};

export const createEc2Cluster = ({
  stack,
  vpc
}: CreateEc2ClusterProps): Cluster => {
  const cluster = new Cluster(stack, "plutomi-cluster", {
    vpc
  });

  cluster.addCapacity("plutomi-cluster-capacity", {
    instanceType: InstanceType.of(InstanceClass.T4G, InstanceSize.NANO),
    desiredCapacity: 1
  });

  return cluster;
};
