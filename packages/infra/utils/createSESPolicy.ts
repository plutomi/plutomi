import type { Stack } from "aws-cdk-lib";
import { Effect, PolicyStatement, Policy } from "aws-cdk-lib/aws-iam";
import { env } from "./env";

type CreateSESPolicyProps = {
  stack: Stack;
};

enum SESPolicies {
  SendEmail = "ses:SendEmail",
  SendRawEmail = "ses:SendRawEmail",
  SendTemplatedEmail = "ses:SendTemplatedEmail"
}

export const createSESPolicy = ({ stack }: CreateSESPolicyProps) => {
  const sesSendEmailPolicy = new PolicyStatement({
    effect: Effect.ALLOW,
    actions: [
      SESPolicies.SendEmail,
      SESPolicies.SendRawEmail,
      SESPolicies.SendTemplatedEmail
    ],
    resources: [
      `arn:aws:ses:${env.AWS_REGION}:${env.AWS_ACCOUNT_ID}:identity/${env.DOMAIN}`
    ]
  });

  const policy = new Policy(
    stack,
    `${env.DEPLOYMENT_ENVIRONMENT}-plutomi-ses-send-email-policy`,
    {
      statements: [sesSendEmailPolicy]
    }
  );

  return policy;
};
