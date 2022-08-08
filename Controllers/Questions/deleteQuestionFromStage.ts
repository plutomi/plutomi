import { Request, Response } from 'express';
import { Stage } from '../../entities/Stage';
import { StageQuestionAdjacentItem } from '../../entities/StageQuestionAdjacentItem';
import { DB } from '../../models';

import * as CreateError from '../../utils/createError';

export const deleteQuestionFromStage = async (req: Request, res: Response) => {
  const { user } = req;
  const { openingId, stageId, questionId } = req.params;

  try {
    const stage = await Stage.findById(stageId, {
      org: user.org,
      openingId,
    });

    if (!stage) {
      return res.status(404).json({ message: 'Stage not found' });
    }

    // TODO delete question from stage

    const questionToRemoveIndex = stage.questionOrder.indexOf(questionId);
    if (questionToRemoveIndex < 0) {
      return res.status(400).json({ message: 'Question not found on stage ' });
    }

    const newQuestionOrder = stage.questionOrder.splice(questionToRemoveIndex, 1);

    // TODo needs transaction
    try {
      await Stage.updateOne(
        {
          _id: stageId,
          org: user.org,
          openingId,
        },
        {
          $set: {
            questionOrder: newQuestionOrder,
          },
          $inc: {
            totalQuestions: -1,
          },
        },
      );

      try {
        await StageQuestionAdjacentItem.deleteOne({
          stageId,
          questionId,
        });
        return res.status(200).json({ message: 'Question removed from stage!' });
      } catch (error) {
        return res
          .status(500)
          .json({ message: 'An error ocurred deleting the adjacent stage / question item' });
      }
    } catch (error) {
      return res
        .status(500)
        .json({ message: 'An error ocurred removing the question from the stage' });
    }

    try {
      return res.status(200).json({ message: 'Question removed from stage!' });
    } catch (error) {
      return res.status(500).json({ message: 'An error ocurred deleting question from stage' });
    }
  } catch (error) {
    return res.status(500).json({ message: 'An error ocurred retrieving stage info' });
  }
};
