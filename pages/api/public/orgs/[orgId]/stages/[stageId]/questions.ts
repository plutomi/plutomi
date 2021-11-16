import { NextApiRequest, NextApiResponse } from "next";
import { getAllQuestionsInStage } from "../../../../../../../utils/questions/getAllQuestionsInStage";
import withCleanOrgId from "../../../../../../../middleware/withCleanOrgId";
import { API_METHODS } from "../../../../../../../defaults";
import withValidMethod from "../../../../../../../middleware/withValidMethod";
import { CUSTOM_QUERY } from "../../../../../../../Types";
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method, query } = req;
  const { orgId, stageId } = query as Pick<CUSTOM_QUERY, "orgId" | "stageId">;

  if (method === API_METHODS.GET) {
    try {
      const questions = await getAllQuestionsInStage({
        orgId,
        stageId,
      });

      // TODO add filter here for public / private questions
      return res.status(200).json(questions);
    } catch (error) {
      return res.status(500).json({ message: "Unable to retrieve questions" });
    }
  }
};

export default withCleanOrgId(withValidMethod(handler, [API_METHODS.GET]));
