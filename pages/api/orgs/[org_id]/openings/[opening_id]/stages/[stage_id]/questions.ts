import { CreateStageQuestion } from "../../../../../../../../utils/stages/createStageQuestion";
import withAuthorizer from "../../../../../../../../middleware/withAuthorizer";
import { NextApiResponse } from "next";
import { GetAllQuestionsInStage } from "../../../../../../../../utils/stages/getAllQuestionsInStage";

const handler = async (req: CustomRequest, res: NextApiResponse) => {
  const { method, query } = req;
  const { org_id, opening_id, stage_id } = query;

  if (method === "GET") {
    try {
      const questions = await GetAllQuestionsInStage({
        org_id,
        opening_id,
        stage_id,
      });

      // TODO i think the issue is we need to sort before sending like we do for stages
      console.log(`Queried questions`);
      console.log(questions);

      return res.status(200).json(questions);
    } catch (error) {
      return res.status(500).json({ message: "Unable to retrieve questions" });
    }
  }
  return res.status(405).json({ message: "Not Allowed" });
};

export default withAuthorizer(handler);
