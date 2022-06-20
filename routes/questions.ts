import { Router } from 'express';
import API from '../Controllers';
import withHasOrg from '../middleware/withHasOrg';
import withSession from '../middleware/withSession';

export const questions = Router();

questions.use(withSession);
questions.use(withHasOrg);

questions.post('', API.Questions.createQuestion);
questions.get('', API.Questions.getQuestionsInOrg);
questions.delete('/:questionId', API.Questions.deleteQuestionFromOrg);
questions.put('/:questionId', API.Questions.updateQuestion);
questions.get('/:questionId', API.Questions.getQuestion);
