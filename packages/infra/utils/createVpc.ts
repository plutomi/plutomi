import {
  InstanceClass,
  InstanceSize,
  InstanceType,
  Vpc
} from "aws-cdk-lib/aws-ec2";
import { FckNatInstanceProvider } from "cdk-fck-nat";
import type { Construct } from "constructs";

type CreateVPCProps = {
  construct: Construct;
};

export const createVpc = ({ construct }: CreateVPCProps): Vpc => {
  const natGatewayProvider = new FckNatInstanceProvider({
    instanceType: InstanceType.of(InstanceClass.T4G, InstanceSize.NANO)
  });

  const vpc = new Vpc(construct, "plutomi-api-fargate-vpc", {
    maxAzs: 3,
    // Very pricy! https://www.lastweekinaws.com/blog/the-aws-managed-nat-gateway-is-unpleasant-and-not-recommended/
    // We are using fck-nat-gateway instead https://fck-nat.dev/deploying/
    natGateways: 0,
    natGatewayProvider
  });

  return vpc;
};
