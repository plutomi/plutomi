import { type Stack } from "aws-cdk-lib";
import { HostedZone, type IHostedZone } from "aws-cdk-lib/aws-route53";

type GetHostedZoneProps = {
  stack: Stack;
};

export const getHostedZone = ({ stack }: GetHostedZoneProps): IHostedZone => {
  const hostedZone = HostedZone.fromLookup(stack, "PlutomiHostedZone", {
    domainName: "plutomi.com"
  });

  return hostedZone;
};
