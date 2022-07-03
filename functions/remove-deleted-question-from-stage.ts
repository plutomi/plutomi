import { DB } from '../models';

// TODO CLEAN THIS UP

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
  const [removed, error] = await DB.Questions.deleteQuestionFromStage(input);

  if (error) {
    console.error(error);
    return;
  }

  console.log('Removed!');
}
