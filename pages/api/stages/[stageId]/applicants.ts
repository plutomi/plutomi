import { NextApiRequest, NextApiResponse } from "next";
import { getAllApplicantsInStage } from "../../../../utils/stages/getAllApplicantsInStage";
import { withSessionRoute } from "../../../../middleware/withSession";
import { API_METHODS } from "../../../../defaults";
import withAuth from "../../../../middleware/withAuth";
import withCleanOrgId from "../../../../middleware/withCleanOrgId";
import withValidMethod from "../../../../middleware/withValidMethod";
import { CUSTOM_QUERY } from "../../../../Types";

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  const { method, query } = req;
  const { stageId } = query as Pick<CUSTOM_QUERY, "stageId">;

  if (method === API_METHODS.GET) {
    const getAllApplicantsInStageInput = {
      orgId: req.session.user.orgId,
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
};

export default withCleanOrgId(
  withValidMethod(withSessionRoute(withAuth(handler)), [API_METHODS.GET])
);
