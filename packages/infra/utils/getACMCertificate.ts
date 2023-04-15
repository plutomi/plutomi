import {
  type ICertificate,
  Certificate
} from "aws-cdk-lib/aws-certificatemanager";
import type { Stack } from "aws-cdk-lib";

type GetACMCertificateProps = {
  stack: Stack;
};

export const getACMCertificate = ({
  stack
}: GetACMCertificateProps): ICertificate => {
  const { region, account } = stack;

  const certificate = Certificate.fromCertificateArn(
    stack,
    "PlutomiCertificate",
    `arn:aws:acm:${region}:${account}:certificate/ACM_CERTIFICATE_ID_TODO`
  );
  return certificate;
};
