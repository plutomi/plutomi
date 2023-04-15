import type { Vpc } from "aws-cdk-lib/aws-ec2";
import type { Construct } from "constructs";
import { Cluster } from "aws-cdk-lib/aws-ecs";

type CreateClusterProps = {
  construct: Construct;
  vpc: Vpc;
};

export const createCluster = ({
  construct,
  vpc
}: CreateClusterProps): Cluster => {
  const cluster = new Cluster(construct, "plutomi-api-fargate-cluster", {
    vpc
  });

  return cluster;
};
