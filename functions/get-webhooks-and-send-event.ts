import { StepFunctionsInvokeActivity } from '@aws-cdk/aws-stepfunctions-tasks';

export async function main(event) {
  console.log('IN WEBHOOKS SENDING FUNCTION');
  console.log(JSON.stringify(event));

  return;
}
