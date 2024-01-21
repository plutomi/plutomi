import { Stack, Duration } from "aws-cdk-lib";
import { Architecture, Runtime } from "aws-cdk-lib/aws-lambda";
import { SqsEventSource } from "aws-cdk-lib/aws-lambda-event-sources";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { RetentionDays } from "aws-cdk-lib/aws-logs";
import {
  ConfigurationSet,
  EventDestination,
  EmailIdentity,
  Identity,
} from "aws-cdk-lib/aws-ses";

import { env } from "../utils/env";

type ConfigureEmailsProps = {
  stack: Stack;
  configurationSet: ConfigurationSet;
};

const sesEmailIdentityName = `ses-identity`;

export const configureEmails = ({
  stack,
  configurationSet,
}: ConfigureEmailsProps) => {
  // Strips out https:// and any trailing slashes
  const rawUrl = new URL(env.NEXT_PUBLIC_BASE_URL).hostname;
  const identity = Identity.domain(rawUrl);

  /**
   * notifications.plutomi.com for production OR
   * notifications.deploymentEnvironment.plutomi.com
   */
  const mailFromDomain = `notifications.${rawUrl}`;

  // Create the SES identity
  void new EmailIdentity(stack, sesEmailIdentityName, {
    identity,
    configurationSet,
    mailFromDomain,
  });
};
