import { Request, Response } from 'express';
import { Org } from '../../entities/Org';
import { Question } from '../../entities/Question';

export const deleteQuestionFromOrg = async (req: Request, res: Response) => {
  const { user } = req;
  try {
    await Question.deleteOne({
      _id: req.params.questionId,
      org: user.org,
    });

    try {
      await Org.updateOne(
        {
          _id: user.org,
        },
        {
          $inc: {
            totalQuestions: -1,
          },
        },
      );

      return res.status(200).json({ message: 'Question deleted!' });
    } catch (error) {
      return res
        .status(200)
        .json({ message: "Question deleted but unable to decrement org's question count" });
    }
  } catch (error) {
    return res.status(500).json({ message: 'An error curred deleting that question' });
  }

};
