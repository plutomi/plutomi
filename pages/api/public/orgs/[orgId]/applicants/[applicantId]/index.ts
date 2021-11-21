import { NextApiRequest, NextApiResponse } from "next";
import { getApplicantById } from "../../../../../../../utils/applicants/getApplicantById";
import withCleanOrgId from "../../../../../../../middleware/withCleanOrgId";
import { API_METHODS, ENTITY_TYPES } from "../../../../../../../Config";
import withValidMethod from "../../../../../../../middleware/withValidMethod";
import { CUSTOM_QUERY } from "../../../../../../../types/main";
import clean from "../../../../../../../utils/clean";
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const user = req.session.user;
  const { method, query, body } = req;
  const { applicantId } = query as Pick<CUSTOM_QUERY, "applicantId">;

  if (method === API_METHODS.GET) {
    try {
      // TODO gather applicant responses here
      const applicant = await getApplicantById({
        applicantId: applicantId,
        orgId: user.orgId,
      });
      // const responses = await GetApplicant
      if (!applicant) {
        return res.status(404).json({ message: "Applicant not found" });
      }

      const cleanedApplicant = clean(applicant, ENTITY_TYPES.APPLICANT);

      return res.status(200).json(cleanedApplicant);
    } catch (error) {
      // TODO add error logger
      return res
        .status(400) // TODO change #
        .json({ message: `Unable to get applicant: ${error}` });
    }
  }
};

export default withCleanOrgId(withValidMethod(handler, [API_METHODS.GET]));
