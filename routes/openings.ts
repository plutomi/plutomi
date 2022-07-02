import { Router } from 'express';
import API from '../Controllers';
import withHasOrg from '../middleware/withHasOrg';
import withSession from '../middleware/withSession';

export const openings = Router();

openings.use(withSession);
openings.use(withHasOrg);

openings.post('', API.Openings.createOpening);
openings.get('', API.Openings.getOpeningsInOrg);
openings.get('/:openingId', API.Openings.getOpening);
openings.delete('/:openingId', API.Openings.deleteOpening);
openings.put('/:openingId', API.Openings.updateOpening);
openings.delete('/:openingId/stages/:stageId', API.Stages.deleteStage);
openings.post(
  '/:openingId/stages/:stageId/questions',

  API.Questions.addQuestionToStage,
);
openings.get('/:openingId/stages/:stageId', API.Stages.getStage);
openings.put('/:openingId/stages/:stageId', API.Stages.updateStage);
openings.delete(
  '/:openingId/stages/:stageId/questions/:questionId',

  API.Questions.deleteQuestionFromStage,
);
openings.get('/:openingId/stages', API.Stages.getStagesInOpening);
openings.get(
  '/:openingId/stages/:stageId/applicants',

  API.Applicants.getApplicantsInStage,
);
openings.get(
  '/:openingId/stages/:stageId/questions',

  API.Questions.getQuestionsInStage,
);
