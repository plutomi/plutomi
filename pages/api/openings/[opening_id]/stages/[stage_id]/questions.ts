import { CreateStageQuestion } from "../../../../../../utils/stages/createStageQuestion";
import { GetStageById } from "../../../../../../utils/stages/getStageById";
import withAuthorizer from "../../../../../../middleware/withAuthorizer";
import { NextApiResponse } from "next";

const handler = async (req: CustomRequest, res: NextApiResponse) => {
  const { body, method, query } = req;
  const user: DynamoUser = req.user;
  const { question_title, question_description }: APICreateQuestionInput = body;
  const { stage_id } = query;

  if (method === "POST") {
    const stage = await GetStageById(stage_id); // TODO this needs to be updated

    if (!stage) {
      return res.status(400).json({ message: "Stage does not exist" });
    }
    const create_stage_question_input: CreateStageQuestionInput = {
      org_id: user.org_id,
      opening_id: stage.opening_id,
      stage_id: stage_id,
      question_title: question_title,
      question_description: question_description,
    };

    try {
      const stage_question = await CreateStageQuestion(
        create_stage_question_input
      );
      return res.status(201).json(stage_question);
    } catch (error) {
      // TODO add error logger
      return res
        .status(400) // TODO change #
        .json({ message: `Unable to create stage question: ${error}` });
    }
  }

  return res.status(405).json({ message: "Not Allowed" });
};

export default withAuthorizer(handler);
