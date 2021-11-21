import { NextApiRequest, NextApiResponse } from "next";
import { getOpening } from "../../../utils/openings/getOpeningById";
import { createApplicant } from "../../../utils/applicants/createApplicant";
import { API_METHODS, EMAILS, ID_LENGTHS } from "../../../Config";
import withAuth from "../../../middleware/withAuth";
import { withSessionRoute } from "../../../middleware/withSession";
import withValidMethod from "../../../middleware/withValidMethod";
import {
  CreateApplicantAPIResponse,
  CreateApplicantAPIBody,
} from "../../../types/main";

import Joi from "joi";
import withCleanOrgId from "../../../middleware/withCleanOrgId";
import sendEmail from "../../../utils/sendEmail";

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<CreateApplicantAPIResponse>
): Promise<void> => {
  const { method, body } = req;
  const {
    orgId,
    openingId,
    firstName,
    lastName,
    email,
    stageId,
  }: CreateApplicantAPIBody = body;

  // Creates an applicant
  if (method === API_METHODS.POST) {
    const opening = await getOpening({ orgId, openingId });

    if (!opening) {
      return res.status(400).json({ message: "Bad opening ID" });
    }

    const firstStage = stageId || opening.stageOrder[0];

    try {
      const schema = Joi.object({
        orgId: Joi.string(),
        email: Joi.string().email(),
        firstName: Joi.string(),
        lastName: Joi.string(),
        openingId: Joi.string().length(ID_LENGTHS.OPENING),
        stageId: Joi.string().length(ID_LENGTHS.STAGE),
      }).options({ presence: "required" });

      const CreateApplicantInput = {
        orgId: orgId,
        email: email,
        firstName: firstName,
        lastName: lastName,
        openingId: openingId,
        stageId: firstStage,
      };

      try {
        const value = await schema.validateAsync(CreateApplicantInput);
        return res.status(200).json({ message: value });
      } catch (error) {
        return res.status(400).json({ message: `${error.message}` });
      }

      const newApplicant = await createApplicant({
        orgId: orgId,
        firstName: firstName,
        lastName: lastName,
        email: email,
        openingId: openingId,
        stageId: firstStage,
      });

      const applicantionLink = `${process.env.NEXT_PUBLIC_WEBSITE_URL}/${orgId}/applicants/${newApplicant.applicantId}`;

      await sendEmail({
        fromName: "Applications",
        fromAddress: EMAILS.GENERAL,
        toAddresses: ["newApplicant.email"], // TODO remove the quotes around this https://github.com/plutomi/plutomi/issues/342
        subject: `Here is a link to your application!`,
        html: `<h1><a href="${applicantionLink}" rel=noreferrer target="_blank" >Click this link to view your application!</a></h1><p>If you did not request this link, you can safely ignore it.</p>`,
      });

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
};

export default withCleanOrgId(withValidMethod(handler, [API_METHODS.POST]));
