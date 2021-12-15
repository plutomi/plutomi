import { Request, Response } from "express";
import { DEFAULTS, EMAILS } from "../Config";
import {
  CreateApplicantAPIBody,
  CreateApplicantResponseInput,
} from "../types/main";
import sendEmail from "../utils/sendEmail";
import * as Openings from "../models/Openings/index";
import * as Applicants from "../models/Applicants/index";
import _ from "lodash";
import Joi from "joi";
import errorFormatter from "../utils/errorFormatter";
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
    const formattedError = errorFormatter(error);
    return res.status(error.$metadata.httpStatusCode).json({
      message: `An error ocurred retrieving opening info`,
      ...formattedError,
    });
  }
  // We need the first stage in this opening
  if (!opening) {
    return res.status(404).json({ message: "Bad opening ID" });
  }

  const [newApplicant, newApplicantError] = await Applicants.createApplicant({
    orgId: orgId,
    firstName: firstName,
    lastName: lastName,
    email: email,
    openingId: openingId,
    stageId: opening.stageOrder[0],
  });

  if (newApplicantError) {
    return res.status(500).json({
      message: "An error ocurred creating your application, please try again",
    });
  }
  const applicantionLink = `${process.env.NEXT_PUBLIC_WEBSITE_URL}/${orgId}/applicants/${newApplicant.applicantId}`;

  const [sent, emailFailure] = await sendEmail({
    // TODO async
    fromName: "Applications",
    fromAddress: EMAILS.GENERAL,
    toAddresses: [newApplicant.email],
    subject: `Here is a link to your application!`,
    html: `<h1><a href="${applicantionLink}" rel=noreferrer target="_blank" >Click this link to view your application!</a></h1><p>If you did not request this link, you can safely ignore it.</p>`,
  });

  if (emailFailure) {
    return res.status(500).json({
      message:
        "We've created your application link, however, we were not able to send you your email. Please try again",
    });
  }

  return res.status(201).json({
    message: `We've sent a link to your email to complete your application!`,
  });
};

export const get = async (req: Request, res: Response) => {
  const { applicantId } = req.params;

  // TODO gather child items here
  const [applicant, error] = await Applicants.getApplicantById({
    applicantId: applicantId,
  });

  if (error) {
    return res
      .status(500)
      .json({ message: "An error ocurred getting applicant info" });
  }
  if (!applicant) {
    return res.status(404).json({ message: "Applicant not found" });
  }
  return res.status(200).json(applicant);
};

export const remove = async (req: Request, res: Response) => {
  const { applicantId } = req.params;

  const [success, failure] = await Applicants.deleteApplicant({
    orgId: req.session.user.orgId,
    applicantId: applicantId!,
  });

  if (failure) {
    return res
      .status(500)
      .json({ message: "An error ocurred deleting this applicant" });
  }

  return res.status(200).json({ message: "Applicant deleted!" });
};

export const update = async (req: Request, res: Response) => {
  const { applicantId } = req.params;
  const { newApplicantValues } = req.body;

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

  const [success, failure] = await Applicants.updateApplicant(
    updateApplicantInput
  );

  if (failure) {
    return res
      .status(500)
      .json({ message: "An error ocurred updating this applicant :(" });
  }
  return res.status(200).json({ message: "Applicant updated!" });
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

  const [applicant, error] = await Applicants.getApplicantById({
    applicantId: applicantId,
  });
  if (error) {
    return res.status(500).json({
      message: "An error ocurred retrieving this applicant's information",
    });
  }
  try {
    // TODO rework this
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
