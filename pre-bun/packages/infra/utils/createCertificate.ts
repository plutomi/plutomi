import {
  type ICertificate,
  Certificate,
  CertificateValidation
} from "aws-cdk-lib/aws-certificatemanager";
import type { IHostedZone } from "aws-cdk-lib/aws-route53";
import type { Stack } from "aws-cdk-lib";
import { env } from "./env";

type GetACMCertificateProps = {
  stack: Stack;
  hostedZone: IHostedZone;
};

export const createCertificate = ({
  stack,
  hostedZone
}: GetACMCertificateProps): ICertificate => {
  const certificate = new Certificate(stack, "ACM-Certificate", {
    domainName: new URL(env.NEXT_PUBLIC_BASE_URL).hostname,
    validation: CertificateValidation.fromDns(hostedZone)
  });

  return certificate;
};
