import type { FargateService } from "aws-cdk-lib/aws-ecs";
import type { Function } from "aws-cdk-lib/aws-lambda";
import { Effect, PolicyStatement } from "aws-cdk-lib/aws-iam";

type DisableLocalLoggingProps = {
  fargateService: FargateService;
  emailEventsConsumer: Function;
  plutomiEventsConsumer: Function;
};
/**
 *
 * CloudWatch is expensive and we don't want to log anything really.
 * https://github.com/plutomi/plutomi/issues/944
 * Idea from AJ Stuyvenberg -> https://twitter.com/astuyve/status/1747652289676878251
 *
 */
export const disableCloudWatchLogging = ({
  fargateService,
  emailEventsConsumer,
  plutomiEventsConsumer,
}: DisableLocalLoggingProps) => {
  // Define the IAM policy statement
  const denyLogsPolicyStatement = new PolicyStatement({
    effect: Effect.DENY,
    actions: [
      "logs:CreateLogGroup",
      "logs:CreateLogStream",
      "logs:PutLogEvents",
    ],
    resources: ["arn:aws:logs:*:*:*"],
  });

  // Add the policy statement to the task role
  fargateService.taskDefinition.taskRole.addToPrincipalPolicy(
    denyLogsPolicyStatement
  );

  // Add the policy statement to the SES events consumer
  emailEventsConsumer.addToRolePolicy(denyLogsPolicyStatement);

  // Add the policy statement to the Plutomi events consumer
  plutomiEventsConsumer.addToRolePolicy(denyLogsPolicyStatement);
};
