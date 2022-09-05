import * as cdk from 'aws-cdk-lib';
import { BuildEnvironmentVariableType } from 'aws-cdk-lib/aws-codebuild';
import {
  CodePipeline,
  CodePipelineSource,
  ShellStep,
  ManualApprovalStep,
} from 'aws-cdk-lib/pipelines';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import * as sm from 'aws-cdk-lib/aws-secretsmanager';

interface CiCdPipelineStackProps {}

export default class AppStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: CiCdPipelineStackProps) {
    super(scope, id, props);

    // TODO create a new pipeline on `prod` branch

    const DEV_HOSTED_ZONE_ID = ssm.StringParameter.valueForStringParameter(
      this,
      '/plutomi/development/HOSTED_ZONE_ID',
    );

    const DEV_ACM_CERTIFICATE_ID = ssm.StringParameter.valueForStringParameter(
      this,
      '/plutomi/development/ACM_CERTIFICATE_ID',
    );

    const DEV_GITHUB_COMMITS_TOKEN = ssm.StringParameter.valueForStringParameter(
      this,
      '/plutomi/development/GITHUB_COMMITS_TOKEN',
    );

    const DEV_LOGIN_LINKS_PASSWORD = sm.Secret.fromSecretNameV2(
      this,
      `DEV_LOGIN_LINKS_PASSWORD`,
      '/plutomi/development/LOGIN_LINKS_PASSWORD',
    );

    const DEV_SESSION_SIGNATURE_SECRET_1 = sm.Secret.fromSecretNameV2(
      this,
      `DEV_SESSION_SIGNATURE_SECRET_1`,
      '/plutomi/development/SESSION_SIGNATURE_SECRET_1',
    );

    new CodePipeline(this, `${process.env.NODE_ENV}-CiCdPipeline`, {
      pipelineName: `${process.env.NODE_ENV}-CiCdPipeline`,
      synth: new ShellStep(`${process.env.NODE_ENV}-PlutomiSynth`, {
        input: CodePipelineSource.gitHub(`plutomi/plutomi`, 'main'),
        commands: [`npm ci`, `npm run build`, `npx cdk synth`],
      }),
      codeBuildDefaults: {
        buildEnvironment: {
          // Manually add these variables to Secrets Manager / Parameter Store
          environmentVariables: {
            // TODO set NODE_ENV
            HOSTED_ZONE_ID: {
              type: BuildEnvironmentVariableType.PARAMETER_STORE,
              value: DEV_HOSTED_ZONE_ID,
            },
            ACM_CERTIFICATE_ID: {
              type: BuildEnvironmentVariableType.PARAMETER_STORE,
              value: DEV_ACM_CERTIFICATE_ID,
            },

            GITHUB_COMMITS_TOKEN: {
              // For getting all commits on the FE, see `pages/index.ts`
              type: BuildEnvironmentVariableType.PARAMETER_STORE,
              value: DEV_GITHUB_COMMITS_TOKEN,
            },

            LOGIN_LINKS_PASSWORD: {
              // Set to auto rotate
              type: BuildEnvironmentVariableType.SECRETS_MANAGER,
              value: DEV_LOGIN_LINKS_PASSWORD,
            },
            SESSION_SIGNATURE_SECRET_1: {
              // Set to auto rotate
              type: BuildEnvironmentVariableType.SECRETS_MANAGER,
              value: DEV_SESSION_SIGNATURE_SECRET_1,
            },
          },
        },
      },
    });
  }
}
