import {
  InstanceClass,
  InstanceSize,
  InstanceType,
  Vpc,
} from "aws-cdk-lib/aws-ec2";
import { FckNatInstanceProvider } from "cdk-fck-nat";
import type { Stack } from "aws-cdk-lib";

type CreateVPCProps = {
  stack: Stack;
};

type CreateVPCResult = {
  vpc: Vpc;
  natGatewayProvider: FckNatInstanceProvider;
};

const vpcName = "plutomi-vpc";

export const createVpc = ({ stack }: CreateVPCProps): CreateVPCResult => {
  const natGatewayProvider = new FckNatInstanceProvider({
    instanceType: InstanceType.of(InstanceClass.T4G, InstanceSize.NANO),
  });

  // ! TODO: Set natGateways and AZs equal to reduce cross-az costs
  const vpc = new Vpc(stack, vpcName, {
    vpcName,
    maxAzs: 3,

    // Very pricy! https://www.lastweekinaws.com/blog/the-aws-managed-nat-gateway-is-unpleasant-and-not-recommended/
    // We are using fck-nat-gateway instead https://fck-nat.dev/deploying/
    natGateways: 1,
    natGatewayProvider,
  });

  return { vpc, natGatewayProvider };
};
