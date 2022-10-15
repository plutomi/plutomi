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
 * const ORG_DELETED = sfn.Condition.stringEquals('$.detail.entityType', Entities.ORG);
*  const ORG_HAS_QUESTIONS = sfn.Condition.numberGreaterThan('$.detail.OldImage.totalQuestions', 0);
 *     const definition = new Choice(this, 'WhichEntity?')
      .when(
        ORG_DELETED,
        new sfn.Parallel(this, 'OrgCleanup')
          .branch(
            new Choice(this, 'OrgHasQuestions')
              .when(
                ORG_HAS_QUESTIONS,
                new tasks.LambdaInvoke(this, 'DeletQuestionsFromOrg', {
                  lambdaFunction: deleteQuestionsFromOrgFunction,
                }),
              )
              .otherwise(new sfn.Succeed(this, "Org doesn't have questions")),
          )
 */
export async function main(event: EventBridgeEvent<'stream', CustomEventBridgeEvent>) {
  console.log('Incoming event: ', JSON.stringify(event));
  const deletedEntity = event.detail.OldImage;
  return;
  // TODO temporarily disabled
  // if (deletedEntity.entityType === Entities.ORG && deletedEntity.totalQuestions > 0) {
  //   console.log('Org has questions, deleting...');

  //   const [allQuestions, allQuestionsError] = await DB.Questions.getQuestionsInOrg({
  //     orgId: event.detail.orgId,
  //   });

  //   if (allQuestionsError) {
  //     console.error(
  //       'An error ocurred retrieving questions in an org to delete...',
  //       allQuestionsError,
  //     );
  //     return;
  //   }

  //   try {
  //     await Promise.all(
  //       allQuestions.map(async (question) =>
  //         DB.Questions.deleteQuestionFromOrg({
  //           orgId: deletedEntity.orgId,
  //           questionId: question.questionId,
  //           updateOrg: false,
  //         }),
  //       ),
  //     );
  //     console.log('All questions deleted!');
  //   } catch (error) {
  //     console.log('An error ocurred deleting questions in org', error);
  //   }
  // }
}
