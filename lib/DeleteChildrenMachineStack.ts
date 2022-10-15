import * as cdk from 'aws-cdk-lib';
import * as sfn from 'aws-cdk-lib/aws-stepfunctions';
import * as tasks from 'aws-cdk-lib/aws-stepfunctions-tasks';
import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import { Choice } from 'aws-cdk-lib/aws-stepfunctions';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as iam from 'aws-cdk-lib/aws-iam';
import { DYNAMO_TABLE_NAME, Entities } from '../Config';
import { DynamoIAM } from '../types/dynamo';
import { ENVIRONMENT } from './AppStack';
import { env } from '../env';
import { getLambdaConfig } from '../utils/getLambdaConfig';

interface CustomLambdaFunction {
  functionName: string;
  /**
   * Under /functions, what is the file name
   */
  fileName: `${string}.ts`;
  description: string;
  permissions: DynamoIAM[];
  permissionArns: string[];
}

interface DeleteChildrenMachineProps extends cdk.StackProps {
  table: Table;
}
/**
 * When an item is deleted, this deletes all children in the item or from other items.
 * For example: When deleting a question from an org this should delete the question from all stages.
 *
 * When deleting a stage, this should delete all applicants inside of it.
 *
 * When deleting an applicant, this should delete all files, notes, whatever else.
 *
 * When deleting an org, start deleting the top level items (openings, webhooks, questions).
 */
export default class DeleteChildrenMachineStack extends cdk.Stack {
  public DeleteChildrenMachine: sfn.StateMachine;
  /**
   * @param {cdk.Construct} scope
   * @param {string} id
   * @param {cdk.StackProps=} props
   */

  constructor(scope: cdk.App, id: string, props: DeleteChildrenMachineProps) {
    super(scope, id, props);

    /**
     * When an OPENING is deleted,
     * delete all stages for it
     */
    const OPENING_DELETED = sfn.Condition.stringEquals('$.detail.entityType', Entities.OPENING);
    const OPENING_HAS_STAGES = sfn.Condition.numberGreaterThan('$.detail.OldImage.totalStages', 0);

    // ------------------------------------------------------------
    /**
     *  When an ORG is deleted
     *  Delete all openings inside the org
     *  Delete all questions inside the org
     *  Delete all webhooks inside the org
     *
     */
    const ORG_DELETED = sfn.Condition.stringEquals('$.detail.entityType', Entities.ORG);
    const ORG_HAS_OPENINGS = sfn.Condition.numberGreaterThan('$.detail.OldImage.totalOpenings', 0);

    // TODO not being used
    const ORG_HAS_QUESTIONS = sfn.Condition.numberGreaterThan(
      '$.detail.OldImage.totalQuestions',
      0,
    );

    const ORG_HAS_WEBHOOKS = sfn.Condition.numberGreaterThan('$.detail.OldImage.totalWebhooks', 0);

    const QUESTION_DELETED = sfn.Condition.stringEquals('$.detail.entityType', Entities.QUESTION);

    const QUESTION_HAS_STAGES = sfn.Condition.numberGreaterThan('$.detail.OldImage.totalStages', 0);

    const STAGE_HAS_QUESTIONS = sfn.Condition.numberGreaterThan(
      '$.detail.OldImage.totalQuestions',
      0,
    );

    // Delete questions and the adjacent item TODO
    const STAGE_DELETED = sfn.Condition.stringEquals('$.detail.entityType', Entities.STAGE);

    const createFunctions = ({
      permissions,
      permissionArns,
      functionName,
      fileName,
      description,
    }: CustomLambdaFunction) => {
      const createdFunction = new NodejsFunction(
        this,
        `${env.deploymentEnvironment}-${functionName}`,
        {
          ...getLambdaConfig({
            functionName: `${env.deploymentEnvironment}-${functionName}`,
            functionDescription: description,
            fileName,
            cascadingDeletion: functionName.includes('delete-') || functionName.includes('remove-'),
          }),
          environment: { ...ENVIRONMENT, DYNAMO_TABLE_NAME },
        },
      );

      const functionPolicy = new iam.PolicyStatement({
        actions: permissions,
        resources: permissionArns,
      });

      createdFunction.role.attachInlinePolicy(
        new iam.Policy(this, `${env.deploymentEnvironment}-${functionName}-policy`, {
          statements: [functionPolicy],
        }),
      );

      return createdFunction;
    };

    const deleteStagesFromOpeningFunction = createFunctions({
      functionName: `delete-stages-from-opening-function`,
      description: 'Removes stages from an opening that was recently deleted',
      fileName: 'delete-stages-from-opening.ts',
      permissions: [DynamoIAM.DeleteItem],
      permissionArns: [props.table.tableArn],
    });

    const removeDeletedQuestionFromStageFunction = createFunctions({
      functionName: `remove-deleted-question-from-stages-function`,
      description: 'Removes questions from a stage once a question is deleted',
      fileName: 'remove-deleted-question-from-stage.ts',
      permissions: [DynamoIAM.Query, DynamoIAM.GetItem, DynamoIAM.DeleteItem, DynamoIAM.UpdateItem],
      permissionArns: [props.table.tableArn, `${props.table.tableArn}/index/GSI1`],
    });

    const deleteOpeningsFromOrgFunction = createFunctions({
      functionName: `delete-openings-from-org-function`,
      description: 'Removes openings from an org when an org is deleted',
      fileName: 'delete-openings-from-org.ts',
      permissions: [DynamoIAM.DeleteItem, DynamoIAM.Query],
      permissionArns: [props.table.tableArn, `${props.table.tableArn}/index/GSI1`],
    });

    const deleteQuestionsFromOrgFunction = createFunctions({
      functionName: `delete-questions-from-org-function`,
      description: 'Removes questions from an org when an org is deleted',
      fileName: 'delete-questions-from-org.ts',
      permissions: [DynamoIAM.DeleteItem, DynamoIAM.Query],
      permissionArns: [props.table.tableArn, `${props.table.tableArn}/index/GSI1`],
    });

    const deleteWebhooksFromOrgFunction = createFunctions({
      functionName: `delete-webhooks-from-org-function`,
      description: 'Removes webhooks from an org when an org is deleted',
      fileName: 'delete-webhooks-from-org.ts',
      permissions: [DynamoIAM.DeleteItem, DynamoIAM.Query],
      permissionArns: [props.table.tableArn, `${props.table.tableArn}/index/GSI1`],
    });

    const deleteQuestionStageAdjacentIteFunction = createFunctions({
      functionName: `delete-question-stage-adjacent-item`,
      description: 'Handles deleting adjacent stage items when stages are deleted.',
      fileName: 'delete-question-stage-adjacent-item.ts',
      permissions: [DynamoIAM.DeleteItem, DynamoIAM.UpdateItem],
      permissionArns: [props.table.tableArn],
    });

    const definition = new Choice(this, 'WhichEntity?')
      .when(
        OPENING_DELETED,
        new Choice(this, 'Does Opening have stages?')
          .when(
            OPENING_HAS_STAGES,
            new tasks.LambdaInvoke(this, 'DeleteStagesFromOpening', {
              lambdaFunction: deleteStagesFromOpeningFunction,
            }),
          )
          .otherwise(new sfn.Succeed(this, "Opening doesn't have stages :)")),
      )
      .when(
        ORG_DELETED,
        new sfn.Parallel(this, 'OrgCleanup')
          .branch(
            new Choice(this, 'OrgHasOpenings')
              .when(
                ORG_HAS_OPENINGS,
                new tasks.LambdaInvoke(this, 'DeleteOpeningsFromOrg', {
                  lambdaFunction: deleteOpeningsFromOrgFunction,
                }),
              )
              .otherwise(new sfn.Succeed(this, "Org doesn't have openings")),
          )
          .branch(
            new Choice(this, 'OrgHasQuestions')
              .when(
                ORG_HAS_QUESTIONS,
                new tasks.LambdaInvoke(this, 'DeleteQuestionsFromOrg', {
                  lambdaFunction: deleteQuestionsFromOrgFunction,
                }),
              )
              .otherwise(new sfn.Succeed(this, "Org doesn't have questions")),
          )
          .branch(
            new Choice(this, 'OrgHasWebhooks')
              .when(
                ORG_HAS_WEBHOOKS,
                new tasks.LambdaInvoke(this, 'DeleteWebhooksFromOrg', {
                  lambdaFunction: deleteWebhooksFromOrgFunction,
                }),
              )
              .otherwise(new sfn.Succeed(this, "Org doesn't have webhooks")),
          ),
      )
      .when(
        STAGE_DELETED,
        new Choice(this, 'Does Stage Have Questions?')
          .when(
            STAGE_HAS_QUESTIONS,
            new tasks.LambdaInvoke(this, 'DeleteQuestionStageAdjacentItem', {
              lambdaFunction: deleteQuestionStageAdjacentIteFunction,
            }),
          )
          .otherwise(new sfn.Succeed(this, "Stage doesn't have questions")),
      )
      .when(
        QUESTION_DELETED,
        new Choice(this, 'DoesQuestionHaveStages')
          .when(
            QUESTION_HAS_STAGES,
            new tasks.LambdaInvoke(this, 'RemoveDeletedQuestionFromStages', {
              lambdaFunction: removeDeletedQuestionFromStageFunction,
            }),
          )
          .otherwise(new sfn.Succeed(this, 'Question does not have stages :)')),
      )
      .otherwise(new sfn.Succeed(this, 'Nothing to do :)'));

    // ----- State Machine Settings -----
    const log = new LogGroup(this, `${env.deploymentEnvironment}-DeleteChildrenMachineLogGroup`, {
      retention: RetentionDays.ONE_MONTH,
    });

    this.DeleteChildrenMachine = new sfn.StateMachine(this, 'DeleteChildrenMachine', {
      stateMachineName: `${env.deploymentEnvironment}-DeleteChildrenMachine`,
      definition,
      timeout: cdk.Duration.minutes(5),
      stateMachineType: sfn.StateMachineType.EXPRESS,
      logs: {
        // Not enabled by default
        includeExecutionData: true,
        destination: log,
        level: sfn.LogLevel.ALL,
      },
    });

    props.table.grantWriteData(this.DeleteChildrenMachine); // TODO this event should just be update. No need for extra permissions
  }
}
