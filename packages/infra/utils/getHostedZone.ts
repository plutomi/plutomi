import { type Stack } from "aws-cdk-lib";
import { HostedZone, type IHostedZone } from "aws-cdk-lib/aws-route53";
import { env } from "./env";

type GetHostedZoneProps = {
  stack: Stack;
};

const hostedZoneName = "plutomi-hosted-zone";

export const getHostedZone = ({ stack }: GetHostedZoneProps): IHostedZone => {
  const hostedZone = HostedZone.fromLookup(stack, hostedZoneName, {
    domainName: new URL(env.NEXT_PUBLIC_BASE_URL).hostname
  });

  return hostedZone;
};
