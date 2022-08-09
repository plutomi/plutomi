import { Request, Response } from 'express';
import Joi from 'joi';
import { Schema } from 'mongoose';
import { JOI_SETTINGS, LIMITS } from '../../Config';
import { Question } from '../../entities/Question';
import { Stage } from '../../entities/Stage';
import { StageQuestionAdjacentItem } from '../../entities/StageQuestionAdjacentItem';
import * as CreateError from '../../utils/createError';
import getNewChildItemOrder from '../../utils/getNewChildItemOrder';

const schema = Joi.object({
  body: {
    questionId: Joi.string(),
    /**
     * 0 based index on where should the question should be added
     * If no position is provided, question is added to the end of the stage
     */
    position: Joi.number()
      .min(0)
      .max(LIMITS.MAX_CHILD_ITEM_LIMIT - 1),
  },
}).options(JOI_SETTINGS);

export const addQuestionToStage = async (req: Request, res: Response) => {
  const { user } = req;
  try {
    await schema.validateAsync(req);
  } catch (error) {
    const { status, body } = CreateError.JOI(error);
    return res.status(status).json(body);
  }

  // TODO types
  const { questionId, position }: { questionId: string; position?: number } = req.body;
  const { openingId, stageId } = req.params;

  try {
    const question = await Question.findById({
      _id: questionId,
      orgId: user.org,
    });

    if (!question) {
      return res.status(404).json({
        message: `A question with the ID of '${questionId}' does not exist in this org`,
      });
    }

    try {
      const stage = await Stage.findById(stageId, {
        org: user.org,
        openingId,
      });

      if (!stage) {
        return res.status(404).json({ message: 'An error ocurred retrieving stage info' });
      }

      // Block questions from being added to a stage if it already exists in the stage
      if (stage.questionOrder.includes(questionId as unknown as Schema.Types.ObjectId)) {
        // TODo improve this type
        return res.status(409).json({
          message: `A question with the ID of '${questionId}' already exists in this stage. Please use a different question ID or delete the old one.`,
        });
      }

      // Update the stage with the new questionOrder
      const questionOrder = getNewChildItemOrder(
        // TODo improve this type
        questionId as unknown as Schema.Types.ObjectId,
        stage.questionOrder,
        position,
      );

      try {
        await Stage.updateOne(
          {
            _id: stageId,
            org: user.org,
            openingId,
          },
          {
            $set: {
              questionOrder,
            },
            $inc: {
              totalQuestions: 1,
            },
          },
        );

        try {
          await Question.updateOne(
            {
              _id: questionId,
              org: user.org,
            },
            {
              $inc: {
                totalStages: 1,
              },
            },
          );

          try {
            const stageQuestionAdjacentItem = new StageQuestionAdjacentItem({
              org: user.org,
              questionId: question._id,
              stageId: stage._id,
            });

            await stageQuestionAdjacentItem.save();
            return res.status(200).json({ message: 'Question added to stage!' });
          } catch (error) {
            return res
              .status(500)
              .json({ message: 'An error ocurred creating the stage / question adjacent items' });
          }
        } catch (error) {
          return res.status(500).json({ message: 'Unable to increment stage count on question' });
        }
      } catch (error) {
        return res
          .status(500)
          .json({ message: 'An error ocurred updating the stage with the new question' });
      }
    } catch (error) {
      return res.status(500).json({ message: 'An error ocurred retrieving stage info' });
    }
  } catch (error) {
    return res.status(500).json({ message: 'An error ocurred retrieving question info' });
  }
};
