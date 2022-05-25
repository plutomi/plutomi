import * as Questions from '../models/Questions';

/**
 * MAJOR TODO -
 * I really don't think this lambda is needed.
 * https://github.com/plutomi/plutomi/issues/566
 * Have to figure out a way to edit an array with JSONPath directly, im sure its possible
 */
export async function main(event) {
  // TODO types
  console.log(JSON.stringify(event));

  const { stage } = event;
  const item = stage.questionOrder.L.find((item) => item.S === event.questionId);
  const deleteIndex = stage.questionOrder.L.indexOf(item);
  // TODO types
  const input = {
    decrementStageCount: false,
    openingId: stage.openingId.S,
    orgId: stage.orgId.S,
    questionId: event.questionId,
    stageId: stage.stageId.S,
    deleteIndex,
  };

  console.log(input);
  const [removed, error] = await Questions.DeleteQuestionFromStage(input);

  if (error) {
    console.error(error);
    return;
  }

  console.log('Removed!');
}
