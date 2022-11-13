import { Router } from 'express';
import API from '../controllers';
import withHasOrg from '../middleware/withHasOrg';
import withSession from '../middleware/withSession';

export const stages = Router();

stages.use(withSession);
stages.use(withHasOrg);

stages.post('', API.Stages.createStage);
stages.delete('/:stageId', API.Stages.deleteStage);
// TODO delete question from stage
stages.get('/:stageId', API.Stages.getStage);
stages.put('/:stageId', API.Stages.updateStage);

stages.post(
  '/:stageId/questions',

  API.Questions.addQuestionToStage,
);
stages.delete('/:stageId/questions/:questionId', API.Questions.deleteQuestionFromStage);
stages.get('/:stageId/questions', API.Questions.getQuestionsInStage);

// // TODO!
// stages.get(
//   '/:stageId/applicants',

//   API.Applicants.getApplicantsInStage,
// );
