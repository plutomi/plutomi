import { NextApiResponse } from "next";
import { getApplicantById } from "../../../../../../../utils/applicants/getApplicantById";
import cleanApplicant from "../../../../../../../utils/clean/cleanApplicant";
import withCleanOrgId from "../../../../../../../middleware/withCleanOrgId";
const handler = async (req: CustomRequest, res: NextApiResponse) => {
  const user = req.user;
  const { method, query, body } = req;
  const { applicantId } = query as CustomQuery;

  const getApplicantInput: GetApplicantInput = {
    orgId: user.orgId,
    applicantId: applicantId,
  };

  if (method === "GET") {
    try {
      // TODO gather applicant responses here
      const applicant = await getApplicantById(getApplicantInput);
      // const responses = await GetApplicant
      if (!applicant) {
        return res.status(404).json({ message: "Applicant not found" });
      }

      const cleanApplicant = cleanApplicant(
        applicant as unknown as DynamoApplicant // TODO fix this crap
      );
      return res.status(200).json(cleanApplicant);
    } catch (error) {
      // TODO add error logger
      return res
        .status(400) // TODO change #
        .json({ message: `Unable to get applicant: ${error}` });
    }
  }

  return res.status(405).json({ message: "Not Allowed" });
};

export default withCleanOrgId(handler);
