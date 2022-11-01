import { NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as path from 'path';
import { Architecture, Runtime } from 'aws-cdk-lib/aws-lambda';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';
import { Duration } from 'aws-cdk-lib';
import { env } from '../env';

interface GetFunctionConfigProps {
  fileName: `${string}.ts`;
  functionName: string;
  functionDescription: string;
  cascadingDeletion: boolean;
}

/**
 * These properties will be reused by the two functions. You can easily override these.
 */
export const getLambdaConfig = ({
  functionName,
  functionDescription,
  fileName,
  cascadingDeletion,
}: GetFunctionConfigProps): Partial<NodejsFunctionProps> => {
  const dir = cascadingDeletion
    ? `../functions/cascadingDeletions/${fileName}`
    : `../functions/${fileName}`;

  const logRetention =
    env.deploymentEnvironment === 'production' ? RetentionDays.ONE_MONTH : RetentionDays.ONE_WEEK;

  return {
    functionName,
    timeout: Duration.seconds(30),
    memorySize: 512,
    logRetention,
    runtime: Runtime.NODEJS_16_X,
    architecture: Architecture.X86_64, // TODO: Test out ARM
    bundling: {
      minify: true,
      externalModules: ['aws-sdk'],
    },
    handler: 'main',
    description: functionDescription,
    entry: path.join(__dirname, dir),
  };
};
