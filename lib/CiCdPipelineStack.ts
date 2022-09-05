import * as cdk from 'aws-cdk-lib';
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

    new CodePipeline(this, `${process.env.NODE_ENV}-CiCdPipeline`, {
      pipelineName: `${process.env.NODE_ENV}-CiCdPipeline`,
      synth: new ShellStep(`${process.env.NODE_ENV}-PlutomiSynth`, {
        input: CodePipelineSource.gitHub(`plutomi/plutomi`, 'main'),
        commands: [`npm ci`, `npm run build`, `npx cdk synth`],
      }),
      codeBuildDefaults: {
        buildEnvironment: {
          environmentVariables: {
            GITHUB_TOKEN: {
              // For getting all commits on the FE, see `pages/index.ts`
              value: process.env.GITHUB_TOKEN,
            },
          },
        },
      },
    });
  }
}
