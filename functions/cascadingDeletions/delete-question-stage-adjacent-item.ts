import { EventBridgeEvent } from 'aws-lambda';
import { Entities } from '../../Config';
import { DB } from '../../models';
import { CustomEventBridgeEvent } from '../stream-processor';

/**
 * When a stage is deleted, asynchronously if that stage had questions, this deletes the adjacent stage / question item and
 * decrements the `totalStages` property on the question
 */
/**
 * ! NOTE !
 * This won't trigger unless the filter is set on the actual step function. Make sure it matches whenever you want this to trigger!
 * The `IF` checks in here are for *type safety* with `discriminated unions` and do not have any effect on whether this function is triggered or not!
 * 
 * This allows us to run functions in parallel if needed.
 * Example:
 * 
 * const STAGE_DELETED = sfn.Condition.stringEquals('$.detail.entityType', Entities.STAGE);
*  const STAGE_HAS_QUESTIONS = sfn.Condition.numberGreaterThan('$.detail.OldImage.totalQuestions', 0); // ! Do not use questionOrder.length as this will be removed with linked list item!
 *     const definition = new Choice(this, 'WhichEntity?')
      .when(
        STAGE_DELETED,
        new sfn.Parallel(this, 'OrgCleanup')
          .branch(
            new Choice(this, 'StageHasQuestions')
              .when(
                STAGE_HAS_QUESTIONS,
                new tasks.LambdaInvoke(this, 'DeleteQuestionStageAdjacentItem', {
                  lambdaFunction: deleteQuestionStageAdjacentIteFunction,
                }),
              )
              .otherwise(new sfn.Succeed(this, "Stage doesn't have questions")),
          )
 */
export async function main(event: EventBridgeEvent<'stream', CustomEventBridgeEvent>) {
  console.log('Incoming event: ', JSON.stringify(event));
  const deletedEntity = event.detail.OldImage;

  return;
  // TODO temporarily disabled
  // if (deletedEntity.entityType === Entities.STAGE && deletedEntity.totalQuestions > 0) {
  //   console.log('Stage has questions, deleting...');

  //   // TODO rework with linked list
  //   for (const question of deletedEntity.questionOrder) {
  //     const [success, error] = await DB.Stages.deleteStageQuestionAdjacentItem({
  //       openingId: deletedEntity.openingId,
  //       stageId: deletedEntity.stageId,
  //       orgId: deletedEntity.orgId,
  //       questionId: question,
  //     });

  //     if (error) {
  //       console.error(
  //         'An error ocurred deleting question',
  //         question,
  //         'once stage was deleted. Stage',
  //         deletedEntity,
  //       );
  //     }
  //   }
  // }
}
