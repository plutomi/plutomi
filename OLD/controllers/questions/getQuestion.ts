// import { Request, Response } from 'express';
// import { Filter } from 'mongodb';
// import { IndexableProperties } from '../../@types/indexableProperties';
// import { QuestionEntity } from '../../models';
// import { findInRelatedToArray } from '../../utils';
// import { collections } from '../../utils/connectToDatabase';

// export const getQuestion = async (req: Request, res: Response) => {
//   const { user } = req;
//   const { questionId } = req.params;

//   const { orgId } = user;
//   let question: QuestionEntity | undefined;
//   try {
//     const questionFilter: Filter<QuestionEntity> = {
//       id: questionId,
//       orgId,
//     };

//     question = (await collections.questions.findOne(questionFilter)) as QuestionEntity;
//     return res.status(200).json(question);
//   } catch (error) {
//     const msg = 'An error ocurred retrieving question info';
//     console.error(msg, error);
//     return res.status(500).json({ message: msg });
//   }
// };
