import * as cdk from 'aws-cdk-lib';
import { BuildEnvironmentVariableType } from 'aws-cdk-lib/aws-codebuild';
import {
  CodePipeline,
  CodePipelineSource,
  ShellStep,
  ManualApprovalStep,
} from 'aws-cdk-lib/pipelines';

import * as sm from 'aws-cdk-lib/aws-secretsmanager';

interface CiCdPipelineStackProps {}

export default class AppStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: CiCdPipelineStackProps) {
    super(scope, id, props);

    // TODO create a new pipeline on `prod` branch

    const PLUTOMI_DEV_ENV_VARS = sm.Secret.fromSecretNameV2(
      this,
      `PLUTOMI_DEV_ENV_VARS`,
      'plutomi/development/env',
    );

    new CodePipeline(this, `${process.env.NODE_ENV}-CiCdPipeline`, {
      pipelineName: `${process.env.NODE_ENV}-CiCdPipeline`,
      synth: new ShellStep(`${process.env.NODE_ENV}-PlutomiSynth`, {
        input: CodePipelineSource.gitHub(`plutomi/plutomi`, 'main'), // TODO create new prod branch
        commands: [`npm ci`, 'ls', `npm run build`, `npx cdk synth`], // TODO remove ls, only for checking where cdk.out is
        // primaryOutputDirectory: 'mysubdir/cdk.out',
      }),
      codeBuildDefaults: {
        buildEnvironment: {
          // Manually add these variables to Secrets Manager / Parameter Store
          // https://docs.aws.amazon.com/codebuild/latest/userguide/build-spec-ref.html#build-spec.env.secrets-manager
          environmentVariables: {
            // TODO set NODE_ENV
            HOSTED_ZONE_ID: {
              type: BuildEnvironmentVariableType.SECRETS_MANAGER,
              value: `${PLUTOMI_DEV_ENV_VARS.secretArn}:HOSTED_ZONE_ID`,
            },
            ACM_CERTIFICATE_ID: {
              type: BuildEnvironmentVariableType.SECRETS_MANAGER,
              value: `${PLUTOMI_DEV_ENV_VARS.secretArn}:ACM_CERTIFICATE_ID`,
            },

            GITHUB_COMMITS_TOKEN: {
              // For getting all commits on the FE, see `pages/index.ts`
              type: BuildEnvironmentVariableType.SECRETS_MANAGER,
              value: `${PLUTOMI_DEV_ENV_VARS.secretArn}:GITHUB_COMMITS_TOKEN`,
            },

            LOGIN_LINKS_PASSWORD: {
              // TODO Set to auto rotate
              type: BuildEnvironmentVariableType.SECRETS_MANAGER,
              value: `${PLUTOMI_DEV_ENV_VARS.secretArn}:LOGIN_LINKS_PASSWORD`,
            },
            SESSION_SIGNATURE_SECRET_1: {
              //TODO Set to auto rotate
              type: BuildEnvironmentVariableType.SECRETS_MANAGER,
              value: `${PLUTOMI_DEV_ENV_VARS.secretArn}:SESSION_SIGNATURE_SECRET_1`,
            },
            NODE_ENV: {
              type: BuildEnvironmentVariableType.SECRETS_MANAGER,
              value: `${PLUTOMI_DEV_ENV_VARS.secretArn}:NODE_ENV`,
            },
          },
        },
      },
    });
  }
}
