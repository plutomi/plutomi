import { Request, Response } from "express";
import { DEFAULTS, EMAILS } from "../Config";
import {
  CreateApplicantAPIBody,
  CreateApplicantResponseInput,
} from "../types/main";
import sendEmail from "../utils/sendEmail";
import * as Openings from "../models/Openings/Openings";
import * as Applicants from "../models/Applicants/Applicants";
import _ from "lodash";
import Joi from "joi";

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

  const [opening, error] = await Openings.getOpeningById({
    orgId,
    openingId,
  });

  if (error) {
    return res
      .status(500)
      .json({ message: "An error ocurred retrieving opening info" });
  }
  // DO NOT REMOVE
  // We need the first stage in this opening
  if (!opening) {
    return res.status(404).json({ message: "Bad opening ID" });
  }

  const newApplicant = await Applicants.createApplicant({
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
};

export const get = async (req: Request, res: Response) => {
  const { applicantId } = req.params;
  try {
    // TODO gather applicant responses here
    const applicant = await Applicants.getApplicantById({
      applicantId: applicantId,
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

export const remove = async (req: Request, res: Response) => {
  const { applicantId } = req.params;
  try {
    await Applicants.deleteApplicant({
      orgId: req.session.user.orgId,
      applicantId: applicantId!,
    });
    return res.status(200).json({ message: "Applicant deleted!" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Unable to delete applicant - ${error}` });
  }
};

export const update = async (req: Request, res: Response) => {
  const { applicantId } = req.params;
  const { newApplicantValues } = req.body;
  try {
    const updateApplicantInput = {
      orgId: req.session.user.orgId,
      applicantId: applicantId,
      newApplicantValues: newApplicantValues,
    };

    const schema = Joi.object({
      orgId: Joi.string().invalid(
        DEFAULTS.NO_ORG,
        tagGenerator.generate(DEFAULTS.NO_ORG)
      ),
      applicantId: Joi.string(),
      newApplicantValues: Joi.object(), // todo add banned keys
    }).options({ presence: "required" });

    // Validate input
    try {
      await schema.validateAsync(updateApplicantInput);
    } catch (error) {
      return res.status(400).json({ message: `${error.message}` });
    }

    await Applicants.updateApplicant(updateApplicantInput);
    return res.status(200).json({ message: "Applicant updated!" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Unable to update applicant - ${error}` });
  }
};

export const answer = async (req: Request, res: Response) => {
  const { applicantId } = req.params;
  const { responses } = req.body;
  const incoming = Joi.object({
    applicantId: Joi.string(),
    responses: Joi.array()
      .items({
        questionId: Joi.string(),
        questionTitle: Joi.string(),
        questionDescription: Joi.string(),
        questionResponse: Joi.string(),
      })
      .options({ presence: "required" }),
  });

  // Validate input
  try {
    await incoming.validateAsync(req.body);
  } catch (error) {
    return res.status(400).json({ message: `${error.message}` });
  }

  const applicant = await Applicants.getApplicantById({
    applicantId: applicantId,
  });
  try {
    // Write questions to Dynamo
    await Promise.all(
      responses.map(async (response) => {
        const { questionTitle, questionDescription, questionResponse } =
          response;

        const createApplicantResponseInput: CreateApplicantResponseInput = {
          orgId: applicant.orgId, // TODO is this needed?
          applicantId: applicantId,
          questionTitle: questionTitle,
          questionDescription: questionDescription,
          questionResponse: questionResponse,
        };

        await Applicants.createResponse(createApplicantResponseInput);
      })
    );

    return res.status(201).json({ message: `Questions answered succesfully!` });
  } catch (error) {
    return res.status(500).json({
      message: `Unable to answer questions, please try again`,
    });
  }
};

/**
 * Get an applicant by their ID
 * @param props - {@link GetApplicantByIdInput}
 * @returns An applicant's metadata and responses
 */
