import * as cdk from 'aws-cdk-lib';
import { BuildEnvironmentVariableType } from 'aws-cdk-lib/aws-codebuild';
import {
  CodePipeline,
  CodePipelineSource,
  ShellStep,
  ManualApprovalStep,
} from 'aws-cdk-lib/pipelines';

interface CiCdPipelineStackProps {}

export default class AppStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: CiCdPipelineStackProps) {
    super(scope, id, props);

    // TODO create a new pipeline on `prod` branch

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
            HOSTED_ZONE_ID: {
              type: BuildEnvironmentVariableType.PARAMETER_STORE,
              value: '/plutomi/development/HOSTED_ZONE_ID',
            },
            ACM_CERTIFICATE_ID: {
              type: BuildEnvironmentVariableType.PARAMETER_STORE,
              value: '/plutomi/development/ACM_CERTIFICATE_ID',
            },
            LOGIN_LINKS_PASSWORD: {
              // Set to auto rotate
              type: BuildEnvironmentVariableType.SECRETS_MANAGER,
              value: '/plutomi/development/LOGIN_LINKS_PASSWORD',
            },
            SESSION_SIGNATURE_SECRET_1: {
              // Set to auto rotate
              type: BuildEnvironmentVariableType.SECRETS_MANAGER,
              value: '/plutomi/development/SESSION_SIGNATURE_SECRET_1',
            },
            GITHUB_COMMITS_TOKEN: {
              // For getting all commits on the FE, see `pages/index.ts`
              type: BuildEnvironmentVariableType.PARAMETER_STORE,
              value: `/plutomi/development/GITHUB_COMMITS_TOKEN`, 
            },
          },
        },
      },
    });
  }
}
