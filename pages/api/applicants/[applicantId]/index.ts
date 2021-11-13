import { NextApiResponse } from "next";
import { getApplicantById } from "../../../../utils/applicants/getApplicantById";
import InputValidation from "../../../../utils/inputValidation";
import deleteApplicant from "../../../../utils/applicants/deleteApplicant";
import updateApplicant from "../../../../utils/applicants/updateApplicant";
import { withSessionRoute } from "../../../../middleware/withSession";

const handler = async (
  req: NextIronRequest,
  res: NextApiResponse
): Promise<void> => {
  const userSession = req.session.user;
  if (!userSession) {
    req.session.destroy();
    return res.status(401).json({ message: "Please log in again" });
  }
  const { method, query, body } = req;
  const { applicantId } = query as CustomQuery;

  const getApplicantInput: GetApplicantInput = {
    orgId: userSession.orgId,
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
      return res.status(200).json(applicant);
    } catch (error) {
      // TODO add error logger
      return res
        .status(400) // TODO change #
        .json({ message: `Unable to get applicant: ${error}` });
    }
  }

  if (method === "PUT") {
    try {
      const updateApplicantInput: UpdateApplicantInput = {
        orgId: userSession.orgId,
        applicantId: applicantId,
        newApplicantValues: body.newApplicantValues,
      };

      try {
        InputValidation(updateApplicantInput);
      } catch (error) {
        return res.status(400).json({ message: `${error.message}` });
      }

      await updateApplicant(updateApplicantInput);
      return res.status(200).json({ message: "Applicant updated!" });
    } catch (error) {
      return res
        .status(500)
        .json({ message: `Unable to update applicant - ${error}` });
    }
  }

  if (method === "DELETE") {
    try {
      await deleteApplicant({
        orgId: userSession.orgId,
        applicantId: applicantId,
      });
      return res.status(200).json({ message: "Applicant deleted!" });
    } catch (error) {
      return res
        .status(500)
        .json({ message: `Unable to delete applicant - ${error}` });
    }
  }
  return res.status(405).json({ message: "Not Allowed" });
};

export default withSessionRoute(handler);
