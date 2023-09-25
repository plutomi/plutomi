import { Stack } from "aws-cdk-lib";
import {
  InstanceType,
  Vpc,
  InstanceClass,
  InstanceSize,
  AmazonLinuxImage,
  MachineImage
} from "aws-cdk-lib/aws-ec2";
import { Cluster, MachineImageType } from "aws-cdk-lib/aws-ecs";
import { INSTANCE_TYPE, NUMBER_OF_INSTANCES } from "./config";

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
    instanceType: INSTANCE_TYPE,
    machineImage: MachineImage.latestAmazonLinux2023(),
    desiredCapacity: NUMBER_OF_INSTANCES
  });

  return cluster;
};
