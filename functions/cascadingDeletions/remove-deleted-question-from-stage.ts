import { EventBridgeEvent } from 'aws-lambda';
import axios from 'axios';
import { Entities } from '../../Config';
import { DB } from '../../models';
import { CustomEventBridgeEvent } from '../stream-processor';

/**
 * ! NOTE !
 * This won't trigger unless the filter is set on the actual step function. Make sure it matches whenever you want this to trigger!
 * The `IF` checks in here are for *type safety* with `discriminated unions` and do not have any effect on whether this function is triggered or not!
 * 
 * This allows us to run functions in parallel if needed.
 * Example:
 * 
 * const QUESTION_DELETED = sfn.Condition.stringEquals('$.detail.entityType', Entities.ORG);
*  const QUESTION_HAS_STAGES = sfn.Condition.numberGreaterThan('$.detail.OldImage.totalStages', 0);
 *     const definition = new Choice(this, 'WhichEntity?')
      .when(
        QUESTION_DELETED,
        new sfn.Parallel(this, 'OrgCleanup')
          .branch(
            new Choice(this, 'QuestionHasStages')
              .when(
                QUESTION_HAS_STAGES,
                new tasks.LambdaInvoke(this, 'RemoveDeletedQuestionFromStage', {
                  lambdaFunction: removeDeletedQuestionFromStage,
                }),
              )
              .otherwise(new sfn.Succeed(this, "Question doesn't have stages")),
          )
 */
export async function main(event: EventBridgeEvent<'stream', CustomEventBridgeEvent>) {
  console.log('Incoming event: ', JSON.stringify(event));
  const deletedEntity = event.detail.OldImage;

  // TODO temporarily disabled

  // // If a question was deleted, get all the stages that have a question
  // // Querying the adjacent item
  // if (deletedEntity.entityType === Entities.QUESTION && deletedEntity.totalStages > 0) {
  //   console.log('Question has stages, deleting...');

  //   const [stagesWithQuestion, stagesError] = await DB.Questions.getAdjacentStageItemsForQuestion({
  //     orgId: deletedEntity.orgId,
  //     questionId: deletedEntity.questionId,
  //   });

  //   if (stagesError) {
  //     console.error('An error ocurred retrieving stages that had this question...', stagesError);
  //     return;
  //   }

  //   if (!stagesWithQuestion.length) {
  //     console.log('This question was not attached to any stages');
  //     return;
  //   }

  //   // TODO, for now, until we implement linked lists, https://github.com/plutomi/plutomi/issues/562
  //   // we need the index of the question within the stage :/

  //   console.log('IN for loop, getting stages for each adjacent stage item');
  //   for (const adjacentStageInfo of stagesWithQuestion) {
  //     console.log(`Adjacent stage item:`, adjacentStageInfo);
  //     const { orgId, stageId, openingId } = adjacentStageInfo;
  //     const [stageInfo, stageError] = await DB.Stages.getStage({
  //       orgId: orgId,
  //       stageId: stageId,
  //       openingId: openingId,
  //     });

  //     if (stageInfo) {
  //       const [deleteQuestionSuccess, deleteQuestionError] =
  //         await DB.Questions.deleteQuestionFromStage({
  //           decrementStageCount: false,
  //           openingId: stageInfo.openingId,
  //           orgId: stageInfo.orgId,
  //           stageId: stageInfo.stageId,
  //           questionId: deletedEntity.questionId,
  //           deleteIndex: stageInfo.questionOrder.indexOf(deletedEntity.questionId),
  //         });

  //       if (deleteQuestionError) {
  //         console.error(
  //           'An error ocurred deleting a question from the stage',
  //           deleteQuestionError,
  //           deletedEntity,
  //         );
  //       }
  //     }

  //     if (stageError) {
  //       console.error(
  //         'An error ocurred retrieving stage info while attempting to delete adjacent stage item',
  //         stagesError,
  //       );
  //     }
  //   }
  // }
}
