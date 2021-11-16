import { NextApiRequest, NextApiResponse } from "next";
import { getAllApplicantsInStage } from "../../../../utils/stages/getAllApplicantsInStage";
import { withSessionRoute } from "../../../../middleware/withSession";

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  const userSession = req.session.user;

  const { method, query } = req;
  const { stageId } = query as Pick<CUSTOM_QUERY, "stageId">;

  if (method === "GET") {
    const getAllApplicantsInStageInput = {
      orgId: userSession.orgId,
      stageId: stageId,
    };

    try {
      const allApplicants = await getAllApplicantsInStage(
        getAllApplicantsInStageInput
      );
      return res.status(200).json(allApplicants);
    } catch (error) {
      // TODO add error logger
      return res
        .status(400) // TODO change #
        .json({ message: `Unable to retrieve applicants: ${error}` });
    }
  }

  return res.status(405).json({ message: "Not Allowed" });
};

export default withSessionRoute(handler);
