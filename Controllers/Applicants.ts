import { Request, Response } from "express";
import Joi from "joi";
import { DEFAULTS, EMAILS } from "../Config";
import { CreateApplicantAPIBody } from "../types/main";
import { createApplicant } from "../utils/applicants/createApplicant";
import { getApplicantById } from "../utils/applicants/getApplicantById";
import { getOpening } from "../utils/openings/getOpeningById";
import sendEmail from "../utils/sendEmail";
const UrlSafeString = require("url-safe-string"),
  tagGenerator = new UrlSafeString();
export const create = async (req: Request, res: Response) => {
  const {
    orgId,
    openingId,
    firstName,
    lastName,
    email,
  }: CreateApplicantAPIBody = req.body;

  const schema = Joi.object({
    orgId: Joi.string().invalid(
      DEFAULTS.NO_ORG,
      tagGenerator.generate(DEFAULTS.NO_ORG)
    ),
    email: Joi.string().email(),
    firstName: Joi.string().invalid(DEFAULTS.FIRST_NAME),
    lastName: Joi.string().invalid(DEFAULTS.FIRST_NAME),
    openingId: Joi.string(),
  }).options({ presence: "required" });

  // Validate input
  try {
    await schema.validateAsync(req.body);
  } catch (error) {
    return res.status(400).json({ message: `${error.message}` });
  }

  try {
    const opening = await getOpening({ orgId, openingId });

    // DO NOT REMOVE
    // We need the first stage in this opening
    if (!opening) {
      return res.status(404).json({ message: "Bad opening ID" });
    }

    try {
      const newApplicant = await createApplicant({
        orgId: orgId,
        firstName: firstName,
        lastName: lastName,
        email: email,
        openingId: openingId,
        stageId: opening.stageOrder[0],
      });

      const applicantionLink = `${process.env.NEXT_PUBLIC_WEBSITE_URL}/${orgId}/applicants/${newApplicant.applicantId}`;

      await sendEmail({
        // TODO async
        fromName: "Applications",
        fromAddress: EMAILS.GENERAL,
        toAddresses: [newApplicant.email],
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
  } catch (error) {
    return res.status(400).json({ message: `${error.message}` });
  }
};

export const get = async (req: Request, res: Response) => {
  const { applicantId } = req.params;
  try {
    // TODO gather applicant responses here
    const applicant = await getApplicantById({
      applicantId: applicantId,
      orgId: req.session.user.orgId,
    });

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
};
