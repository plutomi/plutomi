import * as cdk from 'aws-cdk-lib';
import { BuildEnvironmentVariableType } from 'aws-cdk-lib/aws-codebuild';
import {
  CodePipeline,
  CodePipelineSource,
  ShellStep,
  ManualApprovalStep,
} from 'aws-cdk-lib/pipelines';

import * as sm from 'aws-cdk-lib/aws-secretsmanager';
import PipelineStage from './Stage';

interface CiCdPipelineStackProps {}

export default class CiCdPipelineStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: CiCdPipelineStackProps) {
    super(scope, id, props);

    // TODO create a new pipeline on `prod` branch

    const PLUTOMI_DEV_ENV_VARS = sm.Secret.fromSecretNameV2(
      this,
      `PLUTOMI_DEV_ENV_VARS`,
      'plutomi/development/env', // TODO update to staging"
    );

    // TODO cdk synth runs build beforehand

    const pipeline = new CodePipeline(this, `PlutomiCiCdPipeline`, {
      pipelineName: `PlutomiCiCdPipeline`, //
      synth: new ShellStep(`PlutomiSynth`, {
        input: CodePipelineSource.gitHub(`plutomi/plutomi`, 'cicd'), // todo set to main
        commands: [`npm ci`, `npx cdk synth`, `npm run build`],
        // TODO use correct node version https://github.com/serverless/serverless/issues/8794
      }),
      codeBuildDefaults: {
        buildEnvironment: {
          // Required for bundling lambdas with the aws-lambda-nodejs package
          // https://github.com/aws/aws-cdk/issues/9217
          privileged: true,
          // Manually add these variables to Secrets Manager / Parameter Store
          // https://docs.aws.amazon.com/codebuild/latest/userguide/build-spec-ref.html#build-spec.env.secrets-manager
          environmentVariables: {
            HOSTED_ZONE_ID: {
              type: BuildEnvironmentVariableType.SECRETS_MANAGER,
              value: `${PLUTOMI_DEV_ENV_VARS.secretArn}:HOSTED_ZONE_ID`,
            },
            ACM_CERTIFICATE_ID: {
              type: BuildEnvironmentVariableType.SECRETS_MANAGER,
              value: `${PLUTOMI_DEV_ENV_VARS.secretArn}:ACM_CERTIFICATE_ID`,
            },
            //
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

    const stagingStage = pipeline.addStage(new PipelineStage(this, 'staging'));

    // stagingStage.addPost(new ManualApprovalStep(`Manual approval before production deployment`));
    // const productionStage = pipeline.addStage(new PipelineStage(this, 'production'));
  }
}
