import { CreateStageQuestion } from "../../../../../../utils/stages/createStageQuestion";
import withAuthorizer from "../../../../../../middleware/withAuthorizer";
import { NextApiResponse } from "next";

const handler = async (req: CustomRequest, res: NextApiResponse) => {
  const { body, method, query } = req;
  const user: DynamoUser = req.user;
  const { question_title, question_description }: APICreateQuestionInput = body;
  const { stage_id, opening_id } = query;

  if (method === "POST") {
    const create_stage_question_input: CreateStageQuestionInput = {
      org_id: user.org_id,
      opening_id: opening_id as string,
      stage_id: stage_id as string,
      question_title: question_title,
      question_description: question_description,
    };

    try {
      const stage_question = await CreateStageQuestion(
        create_stage_question_input
      );
      return res.status(201).json({ message: "Question created!" });
    } catch (error) {
      // TODO add error logger
      return res
        .status(500) // TODO change #
        .json({ message: `Unable to create stage question: ${error}` });
    }
  }

  return res.status(405).json({ message: "Not Allowed" });
};

export default withAuthorizer(handler);
