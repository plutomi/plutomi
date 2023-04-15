import { type Stack } from "aws-cdk-lib";
import { HostedZone, type IHostedZone } from "aws-cdk-lib/aws-route53";
import { env } from "../env";

type GetHostedZoneProps = {
  stack: Stack;
};

export const getHostedZone = ({ stack }: GetHostedZoneProps): IHostedZone => {
  const hostedZone = HostedZone.fromLookup(stack, "PlutomiHostedZone", {
    domainName: "plutomi.com"
  });

  // ! TODO:
  // We were using:
  //   HostedZone.fromHostedZoneAttributes(this, "plutomi-hosted-zone", {
  //     hostedZoneId: envVars.HOSTED_ZONE_ID,
  //     zoneName: DOMAIN_NAME
  //   });

  // before

  return hostedZone;
};
