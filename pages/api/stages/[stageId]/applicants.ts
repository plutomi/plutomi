import { NextApiResponse } from "next";
import { getAllApplicantsInStage } from "../../../../utils/stages/getAllApplicantsInStage";
import { withSessionRoute } from "../../../../middleware/withSession";
import { getStage } from "../../../../utils/stages/getStage";

const handler = async (
  req: NextIronRequest,
  res: NextApiResponse
): Promise<void> => {
  const userSession = req.session.user;
  if (!userSession) {
    req.session.destroy();
    return res.status(401).json({ message: "Please log in again" });
  }
  const { method, query } = req;
  const { stageId } = query as CustomQuery;

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
