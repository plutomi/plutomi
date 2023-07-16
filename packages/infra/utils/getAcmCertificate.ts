import {
  type ICertificate,
  Certificate
} from "aws-cdk-lib/aws-certificatemanager";
import type { Stack } from "aws-cdk-lib";
import { env } from "./env";

type GetACMCertificateProps = {
  stack: Stack;
};

export const getACMCertificate = ({
  stack
}: GetACMCertificateProps): ICertificate => {
  const certificate = Certificate.fromCertificateArn(
    stack,
    "PlutomiCertificate",
    `arn:aws:acm:${stack.region}:${stack.account}:certificate/${env.ACM_CERTIFICATE_ID}`
  );
  return certificate;
};
