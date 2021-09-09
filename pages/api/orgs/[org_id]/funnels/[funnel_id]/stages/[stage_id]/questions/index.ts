import { NextApiRequest, NextApiResponse } from "next";
import { CreateStageQuestion } from "../../../../../../../../../utils/stages/createStageQuestion";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { body, method, query } = req;
  const { question_title, question_description } = body;
  const { org_id, funnel_id, stage_id } = query;

  if (method === "POST") {
    const create_stage_question_input: CreateStageQuestionInput = {
      org_id: org_id as string,
      funnel_id: funnel_id as string,
      stage_id: stage_id as string,
      question_title: question_title,
      question_description: question_description,
    };

    let missing_keys = [];
    for (const [key, value] of Object.entries(create_stage_question_input)) {
      if (value == undefined) {
        missing_keys.push(`'${key}'`);
      }
    }
    if (missing_keys.length > 0)
      return res.status(400).json({
        message: `Bad request: ${missing_keys.join(", ")} missing`,
      });

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

export default handler;
