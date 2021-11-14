import { NextApiRequest, NextApiResponse } from "next";
import { getOpening } from "../../../utils/openings/getOpeningById";
import InputValidation from "../../../utils/inputValidation";
import { createApplicant } from "../../../utils/applicants/createApplicant";
import { getOrg } from "../../../utils/orgs/getOrg";
import sendApplicantLink from "../../../utils/applicantEmail/sendApplicantLink";

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  const { method, body } = req;
  const { orgId, openingId, firstName, lastName, applicantEmail } = body;

  // Creates an applicant
  if (method === "POST") {
    const opening = await getOpening({ orgId, openingId });

    if (!opening) {
      return res.status(400).json({ message: "Bad opening ID" });
    }
    try {
      const createApplicantInput = {
        orgId: orgId,
        applicantEmail: applicantEmail,
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

      const newApplicant = await createApplicant({
        orgId: orgId,
        applicantEmail: applicantEmail,
        openingId: openingId,
        stageId: opening.stageOrder[0],
      });
      // const newApplicant = await createApplicant(
      //   orgId,
      //   applicantEmail,
      //   firstName,
      //   lastName,
      //   openingId,
      //   opening.stageOrder[0]
      // );
      const org = await getOrg(orgId);

      const sendApplicantLinkInput = {
        applicantEmail: newApplicant.applicantEmail,
        orgId: orgId,
        orgName: org.GSI1SK,
        applicantId: newApplicant.applicantId,
      };
      await sendApplicantLink(sendApplicantLinkInput);

      return res.status(201).json({
        message: `We've sent a link to your applicantEmail to complete your application!`,
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
