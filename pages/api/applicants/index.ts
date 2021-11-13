import { NextApiResponse } from "next";
import { GetOpening } from "../../../utils/openings/getOpeningById";
import InputValidation from "../../../utils/inputValidation";
import { CreateApplicant } from "../../../utils/applicants/createApplicant";
import { GetOrg } from "../../../utils/orgs/getOrg";
import SendApplicantLink from "../../../utils/email/sendApplicantLink";

const handler = async (
  req: NextIronRequest,
  res: NextApiResponse
): Promise<void> => {
  const { method, body } = req;
  const { orgId, openingId, firstName, lastName, email } = body;

  // Creates an applicant
  if (method === "POST") {
    const opening = await GetOpening({ orgId, openingId });

    if (!opening) {
      return res.status(400).json({ message: "Bad opening ID" });
    }
    try {
      const createApplicantInput: CreateApplicantInput = {
        orgId: orgId,
        email: email,
        firstName: firstName,
        lastName: lastName,
        openingId: openingId,
        stageId: opening.stageOrder[0],
      };
      try {
        InputValidation(createApplicantInput);
      } catch (error) {
        return res.status(400).json({ message: `${error.message}` });
      }

      const newApplicant = await CreateApplicant(createApplicantInput);
      const org = await GetOrg(orgId);

      const sendApplicantLinkInput = {
        applicantEmail: newApplicant.email,
        orgId: orgId,
        orgName: org.GSI1SK,
        applicantId: newApplicant.applicantId,
      };
      await SendApplicantLink(sendApplicantLinkInput);

      return res.status(201).json({
        message: `We've sent a link to your email to complete your application!`,
      });
    } catch (error) {
      // TODO add error logger
      return res
        .status(400) // TODO change #
        .json({ message: `Unable to create applicant: ${error}` });
    }
  }

  return res.status(405).json({ message: "Not Allowed" });
};

export default handler;
