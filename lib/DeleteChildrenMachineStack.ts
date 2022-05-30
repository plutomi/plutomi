import * as cdk from '@aws-cdk/core';
import * as sfn from '@aws-cdk/aws-stepfunctions';
import * as tasks from '@aws-cdk/aws-stepfunctions-tasks';
import { LogGroup, RetentionDays } from '@aws-cdk/aws-logs';
import { Table } from '@aws-cdk/aws-dynamodb';
import { Choice, IntegrationPattern } from '@aws-cdk/aws-stepfunctions';
import { NodejsFunction } from '@aws-cdk/aws-lambda-nodejs';
import { Architecture, Runtime } from '@aws-cdk/aws-lambda';
import * as iam from '@aws-cdk/aws-iam';
import path from 'path';
import { DYNAMO_TABLE_NAME, Entities } from '../Config';

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
    const DYNAMO_QUERY_SETTINGS = {
      service: 'dynamodb',
      action: 'query',
      iamResources: [
        props.table.tableArn,
        `${props.table.tableArn}/index/GSI1`,
        `${props.table.tableArn}/index/GSI2`,
      ],
    };

    /**
     * When an OPENING is deleted,
     * delete all stages for it
     */
    const OPENING_DELETED = sfn.Condition.stringEquals(
      '$.detail.OldImage.entityType',
      Entities.OPENING,
    );
    const OPENING_HAS_STAGES = sfn.Condition.numberGreaterThan('$.detail.OldImage.totalStages', 0);

    const GET_STAGES_IN_OPENING = new tasks.CallAwsService(this, 'GetStagesInOpening', {
      ...DYNAMO_QUERY_SETTINGS,
      parameters: {
        TableName: props.table.tableName,
        IndexName: 'GSI1',
        KeyConditionExpression: 'GSI1PK = :GSI1PK',
        ExpressionAttributeValues: {
          ':GSI1PK': {
            'S.$': `States.Format('${Entities.ORG}#{}#${Entities.OPENING}#{}#${Entities.STAGE}S', $.detail.OldImage.orgId, $.detail.OldImage.openingId)`,
          },
        },
      },
      resultSelector: {
        'stages.$': '$.Items',
      },
    });

    const DeleteStagesMap = new sfn.Map(this, 'DeleteStagesInOpeningMap', {
      maxConcurrency: 1,
      inputPath: '$.stages',
      parameters: {
        // Makes it easier to get these attributes per item
        'PK.$': `States.Format('${Entities.ORG}#{}#${Entities.OPENING}#{}#${Entities.STAGE}#{}', $$.Map.Item.Value.orgId.S, $$.Map.Item.Value.openingId.S, $$.Map.Item.Value.stageId.S)`,
        SK: Entities.STAGE,
      },
    });
    DeleteStagesMap.iterator(
      new tasks.DynamoDeleteItem(this, 'DeleteStagesInOpening', {
        table: props.table,
        key: {
          PK: tasks.DynamoAttributeValue.fromString(sfn.JsonPath.stringAt('$.PK')),
          SK: tasks.DynamoAttributeValue.fromString(sfn.JsonPath.stringAt('$.SK')),
        },
      }),
    );
    // ------------------------------------------------------------
    /**
     *  When an ORG is deleted
     *  Delete all openings inside the org
     *  Delete all questions inside the org
     *
     */
    const ORG_DELETED = sfn.Condition.stringEquals('$.detail.OldImage.entityType', Entities.ORG);

    const ORG_HAS_OPENINGS = sfn.Condition.numberGreaterThan('$.detail.OldImage.totalOpenings', 0);

    const GET_OPENINGS_IN_ORG = new tasks.CallAwsService(this, 'GetOpeningsInOrg', {
      ...DYNAMO_QUERY_SETTINGS,
      parameters: {
        TableName: props.table.tableName,
        IndexName: 'GSI1',
        KeyConditionExpression: 'GSI1PK = :GSI1PK',
        ExpressionAttributeValues: {
          ':GSI1PK': {
            'S.$': `States.Format('${Entities.ORG}#{}#${Entities.OPENING}S', $.detail.OldImage.orgId)`,
          },
        },
      },
      resultSelector: {
        'openings.$': '$.Items',
      },
    });

    const DeleteOpeningsMap = new sfn.Map(this, 'DeleteOpeningsInOrgMap', {
      maxConcurrency: 1,
      inputPath: '$.openings',
      parameters: {
        // Makes it easier to get these attributes per item
        'PK.$': `States.Format('${Entities.ORG}#{}#${Entities.OPENING}#{}', $$.Map.Item.Value.orgId.S, $$.Map.Item.Value.openingId.S)`,
        SK: Entities.OPENING,
      },
    });
    DeleteOpeningsMap.iterator(
      new tasks.DynamoDeleteItem(this, 'DeleteOpeningsInOrg', {
        table: props.table,
        key: {
          PK: tasks.DynamoAttributeValue.fromString(sfn.JsonPath.stringAt('$.PK')),
          SK: tasks.DynamoAttributeValue.fromString(sfn.JsonPath.stringAt('$.SK')),
        },
      }),
    );

    // TODO not being used
    const ORG_HAS_QUESTIONS = sfn.Condition.numberGreaterThan(
      '$.detail.OldImage.totalQuestions',
      0,
    );

    const ORG_HAS_WEBHOOKS = sfn.Condition.numberGreaterThan('$.detail.OldImage.totalWebhooks', 0);

    const GET_QUESTIONS_IN_ORG = new tasks.CallAwsService(this, 'GetQuestionsInOrg', {
      ...DYNAMO_QUERY_SETTINGS,
      parameters: {
        TableName: props.table.tableName,
        IndexName: 'GSI1',
        KeyConditionExpression: 'GSI1PK = :GSI1PK',
        ExpressionAttributeValues: {
          ':GSI1PK': {
            'S.$': `States.Format('${Entities.ORG}#{}#${Entities.QUESTION}S', $.detail.OldImage.orgId)`,
          },
        },
      },
      resultSelector: {
        'questions.$': '$.Items',
      },
    });

    const GET_WEBHOOKS_IN_ORG = new tasks.CallAwsService(this, 'GetWebhooksInOrg', {
      ...DYNAMO_QUERY_SETTINGS,
      parameters: {
        TableName: props.table.tableName,
        IndexName: 'GSI1',
        KeyConditionExpression: 'GSI1PK = :GSI1PK',
        ExpressionAttributeValues: {
          ':GSI1PK': {
            'S.$': `States.Format('${Entities.ORG}#{}#${Entities.WEBHOOK}S', $.detail.OldImage.orgId)`,
          },
        },
      },
      resultSelector: {
        'webhooks.$': '$.Items',
      },
    });

    const DeleteWebhooksMap = new sfn.Map(this, 'DeleteWebhooksInOrgMap', {
      maxConcurrency: 1,
      inputPath: '$.webhooks',
      parameters: {
        // Makes it easier to get these attributes per item
        'PK.$': `States.Format('${Entities.ORG}#{}#${Entities.WEBHOOK}#{}', $$.Map.Item.Value.orgId.S, $$.Map.Item.Value.webhookId.S)`,
        SK: Entities.WEBHOOK,
      },
    });

    DeleteWebhooksMap.iterator(
      new tasks.DynamoDeleteItem(this, 'DeleteWebhooksInOrg', {
        table: props.table,
        key: {
          PK: tasks.DynamoAttributeValue.fromString(sfn.JsonPath.stringAt('$.PK')),
          SK: tasks.DynamoAttributeValue.fromString(sfn.JsonPath.stringAt('$.SK')),
        },
      }),
    );

    const DeleteQuestionsMap = new sfn.Map(this, 'DeleteQuestionsInOrgMap', {
      maxConcurrency: 1,
      inputPath: '$.questions',
      parameters: {
        // Makes it easier to get these attributes per item
        'PK.$': `States.Format('${Entities.ORG}#{}#${Entities.QUESTION}#{}', $$.Map.Item.Value.orgId.S, $$.Map.Item.Value.questionId.S)`,
        SK: Entities.QUESTION,
      },
    });
    DeleteQuestionsMap.iterator(
      new tasks.DynamoDeleteItem(this, 'DeleteQuestionsInOrg', {
        table: props.table,
        key: {
          PK: tasks.DynamoAttributeValue.fromString(sfn.JsonPath.stringAt('$.PK')),
          SK: tasks.DynamoAttributeValue.fromString(sfn.JsonPath.stringAt('$.SK')),
        },
      }),
    );

    const QUESTION_DELETED = sfn.Condition.stringEquals('$.detail.entityType', Entities.QUESTION);

    const QUESTION_HAS_STAGES = sfn.Condition.numberGreaterThan('$.detail.OldImage.totalStages', 0);

    const STAGE_HAS_QUESTIONS = sfn.Condition.numberGreaterThan(
      '$.detail.OldImage.totalQuestions',
      0,
    );

    const GET_STAGES_THAT_HAVE_DELETED_QUESTION = new tasks.CallAwsService(
      this,
      'GetStagesThatHaveDeletedQuestion',
      {
        ...DYNAMO_QUERY_SETTINGS,
        parameters: {
          TableName: props.table.tableName,
          KeyConditionExpression: 'PK = :PK',
          ExpressionAttributeValues: {
            ':PK': {
              'S.$': `States.Format('${Entities.ORG}#{}#${Entities.QUESTION}#{}#${Entities.STAGE}S', $.detail.OldImage.orgId, $.detail.OldImage.questionId)`,
            },
          },
        },
        resultSelector: {
          'stages.$': '$.Items',
        },
        resultPath: '$.stages',
      },
    );

    const RemoveDeletedQuestionFromStageFunction = new NodejsFunction(
      this,
      `${process.env.NODE_ENV}-remove-deleted-question-from-stage-function`,
      {
        functionName: `${process.env.NODE_ENV}-remove-deleted-question-from-stage-function`,
        timeout: cdk.Duration.seconds(5),
        memorySize: 256,
        logRetention: RetentionDays.ONE_WEEK,
        runtime: Runtime.NODEJS_14_X,
        architecture: Architecture.ARM_64,
        environment: {
          NODE_ENV: process.env.NODE_ENV,
          DYNAMO_TABLE_NAME,
        },
        bundling: {
          minify: true,
          externalModules: ['aws-sdk'],
        },
        handler: 'main',
        description: 'Removes a deleted question from stages.',
        entry: path.join(__dirname, `/../functions/remove-deleted-question-from-stage.ts`),
      },
    );

    const QUESTION_DELETED_UPDATE_STAGE_INFO_MAP = new sfn.Map(
      this,
      'QuestionDeletedUpdateStageInfoMap',
      {
        maxConcurrency: 1,
        itemsPath: '$.stages.stages',
        parameters: {
          // Makes it easier to get these attributes per item
          'PK.$': `States.Format('${Entities.ORG}#{}#${Entities.OPENING}#{}#${Entities.STAGE}#{}', $$.Map.Item.Value.orgId.S, $$.Map.Item.Value.openingId.S, $$.Map.Item.Value.stageId.S)`,
          SK: Entities.STAGE,
          'questionId.$': '$.detail.OldImage.questionId',
          /**
           * If a stage does not exist, and a question was previously attached to it,
           * this allows retrieving that adjacent item and deleting it.
           * NOTE: Will require the same setup for webhooks
           */
          'adjacentItemPK.$': `States.Format('${Entities.ORG}#{}#${Entities.QUESTION}#{}#${Entities.STAGE}S', $$.Map.Item.Value.orgId.S, $$.Map.Item.Value.questionId.S)`,
          'adjacentItemSK.$': `States.Format('${Entities.OPENING}#{}#${Entities.STAGE}#{}', $$.Map.Item.Value.openingId.S, $$.Map.Item.Value.stageId.S)`,
        },
      },
    );

    const DELETE_ADJACENT_STAGE_QUESTION_ITEM = new tasks.DynamoDeleteItem(
      this,
      'DeleteAdjacentStageQuestionItem',
      {
        table: props.table,
        key: {
          PK: tasks.DynamoAttributeValue.fromString(sfn.JsonPath.stringAt('$.adjacentItemPK')),
          SK: tasks.DynamoAttributeValue.fromString(sfn.JsonPath.stringAt('$.adjacentItemSK')),
        },
      },
    );

    QUESTION_DELETED_UPDATE_STAGE_INFO_MAP.iterator(
      new tasks.DynamoGetItem(this, 'GetCurrentStageInfoForQuestions', {
        table: props.table,
        key: {
          PK: tasks.DynamoAttributeValue.fromString(sfn.JsonPath.stringAt('$.PK')),
          SK: tasks.DynamoAttributeValue.fromString(sfn.JsonPath.stringAt('$.SK')),
        },
        resultPath: '$.stage',
      }).next(
        new sfn.Choice(this, 'Does question-stage exist?')
          .when(
            sfn.Condition.isPresent('$.stage.Item'),
            new tasks.LambdaInvoke(this, 'RemoveDeletedQuestionFromStage', {
              payload: sfn.TaskInput.fromObject({
                stage: sfn.JsonPath.stringAt('$.stage.Item'),
                questionId: sfn.JsonPath.stringAt('$.questionId'),
              }),
              lambdaFunction: RemoveDeletedQuestionFromStageFunction,
              // TODO pretty sure this needs a callback
              integrationPattern: IntegrationPattern.REQUEST_RESPONSE,
            }),
          )
          .otherwise(DELETE_ADJACENT_STAGE_QUESTION_ITEM),
      ),
    );

    // Delete questions and the adjacent item TODO
    const STAGE_DELETED = sfn.Condition.stringEquals(
      '$.detail.OldImage.entityType',
      Entities.STAGE,
    );

    const DynamoDeleteQuestionPolicy = new iam.PolicyStatement({
      actions: ['dynamodb:DeleteItem', 'dynamodb:UpdateItem'],
      resources: [props.table.tableArn],
    });

    RemoveDeletedQuestionFromStageFunction.role.attachInlinePolicy(
      new iam.Policy(this, `${process.env.NODE_ENV}-remove-deleted-question-from-stage-policy`, {
        statements: [DynamoDeleteQuestionPolicy],
      }),
    );
    const definition = new Choice(this, 'WhichEntity?')
      .when(
        OPENING_DELETED,
        new Choice(this, 'Does Opening have stages?')
          .when(OPENING_HAS_STAGES, GET_STAGES_IN_OPENING.next(DeleteStagesMap))
          .otherwise(new sfn.Succeed(this, "Opening doesn't have stages :)")),
      )
      .when(
        ORG_DELETED,
        new sfn.Parallel(this, 'OrgCleanup')
          .branch(
            new Choice(this, 'OrgHasOpenings')
              .when(ORG_HAS_OPENINGS, GET_OPENINGS_IN_ORG.next(DeleteOpeningsMap))
              .otherwise(new sfn.Succeed(this, "Org doesn't have openings")),
          )
          .branch(
            new Choice(this, 'OrgHasQuestions')
              .when(ORG_HAS_QUESTIONS, GET_QUESTIONS_IN_ORG.next(DeleteQuestionsMap))
              .otherwise(new sfn.Succeed(this, "Org doesn't have questions")),
          )
          .branch(
            new Choice(this, 'OrgHasWebhooks')
              .when(ORG_HAS_WEBHOOKS, GET_WEBHOOKS_IN_ORG.next(DeleteWebhooksMap))
              .otherwise(new sfn.Succeed(this, "Org doesn't have webhooks")),
          ),
      )
      .when(
        STAGE_DELETED,
        new Choice(this, 'Does Stage Have Questions?').when(
          STAGE_HAS_QUESTIONS,
          new sfn.Succeed(this, 'TODO delete adjacent item'),
        ),
      )
      .when(
        QUESTION_DELETED,
        new Choice(this, 'DoesQuestionHaveStages')
          .when(
            QUESTION_HAS_STAGES,
            GET_STAGES_THAT_HAVE_DELETED_QUESTION.next(QUESTION_DELETED_UPDATE_STAGE_INFO_MAP),

            // Transaction here
          )
          .otherwise(new sfn.Succeed(this, 'Question does not have stages :)')),
      )
      .otherwise(new sfn.Succeed(this, 'Nothing to do :)'));

    // ----- State Machine Settings -----
    const log = new LogGroup(this, `${process.env.NODE_ENV}-DeleteChildrenMachineLogGroup`, {
      retention: RetentionDays.ONE_MONTH,
    });

    this.DeleteChildrenMachine = new sfn.StateMachine(this, 'DeleteChildrenMachine', {
      stateMachineName: `${process.env.NODE_ENV}-DeleteChildrenMachine`,
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
