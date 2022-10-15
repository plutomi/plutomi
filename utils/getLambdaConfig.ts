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
      minify: false, // ! True breaks MikroORM! DO NOT ENABLE!
      externalModules: [
        /**
         * We need to tell esbuild to ignore these. aws-sdk also comes with the Lambda runtime.
         * https://github.com/mikro-orm/mikro-orm/discussions/2219#discussioncomment-1983334
         */
        'aws-sdk',
        '@mikro-orm/seeder',
        '@mikro-orm/migrations-mongodb',
        '@mikro-orm/mysql',
        '@mikro-orm/mariadb',
        '@mikro-orm/sqlite',
        'pg-native',
        '@mikro-orm/mongo-highlighter',
        '@mikro-orm/entity-generator',
        '@mikro-orm/better-sqlite',
        'mysql2',
        'better-sqlite3',
        'mysql',
        '@mikro-orm/postgresql',
        'sqlite3',
        'tedious',
        'pg-query-stream',
        'oracledb',
      ],
    },
    handler: 'main',
    description: functionDescription,
    entry: path.join(__dirname, dir),
  };
};
