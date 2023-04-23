import {
  InstanceClass,
  InstanceSize,
  InstanceType,
  Vpc
} from "aws-cdk-lib/aws-ec2";
import { FckNatInstanceProvider } from "cdk-fck-nat";
import type { Stack } from "aws-cdk-lib";

type CreateVPCProps = {
  stack: Stack;
};

export const createVpc = ({ stack }: CreateVPCProps): Vpc => {
  const natGatewayProvider = new FckNatInstanceProvider({
    instanceType: InstanceType.of(InstanceClass.T4G, InstanceSize.NANO)
  });

  const vpc = new Vpc(stack, "plutomi-api-fargate-vpc", {
    maxAzs: 3,
    // Very pricy! https://www.lastweekinaws.com/blog/the-aws-managed-nat-gateway-is-unpleasant-and-not-recommended/
    // We are using fck-nat-gateway instead https://fck-nat.dev/deploying/
    natGateways: 3,
    natGatewayProvider
  });

  return vpc;
};
