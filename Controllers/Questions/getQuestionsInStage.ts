import { Request, Response } from 'express';
import { Schema } from 'mongoose';
import { Question } from '../../entities/Question';
import { Stage } from '../../entities/Stage';
import { DB } from '../../models';
import * as CreateError from '../../utils/createError';

export const getQuestionsInStage = async (req: Request, res: Response) => {
  const { user } = req;
  const { openingId, stageId } = req.params;

  try {
    const stage = await Stage.findById(stageId, {
      org: user.org,
      openingId,
    });

    if (!stage) {
      return res.status(404).json({ message: 'Stage not found' });
    }

    const { questionOrder } = stage;

    if (!questionOrder.length) return res.status(200).json([]);

    try {
      // TODO ... ehh. should be cleaned up
      const results = await Promise.all(
        questionOrder.map(async (id: Schema.Types.ObjectId) => {
          const question = await Question.findOne(id, {
            org: user.org,
          });

          // TODO it is possible that a question was deleted so the question will return undefined
          return question;
        }),
      );

      const sortedQuestions = questionOrder.map((i: Schema.Types.ObjectId) =>
        results.find((j) => j._id === i),
      );
      return res.status(200).json(sortedQuestions);
    } catch (error) {
      const { status, body } = CreateError.SDK(
        error,
        'An error ocurred retrieving the questions for this stage',
      );
      return res.status(status).json(body);
    }
  } catch (error) {
    return res.status(500).json({ message: 'An error ocurred retrieving stage info' });
  }
};
