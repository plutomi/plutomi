import { Request, Response } from "express";
import { DEFAULTS, EMAILS } from "../Config";
import {
  CreateApplicantAPIBody,
  CreateApplicantResponseInput,
} from "../types/main";
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
    return res.status(formattedError.httpStatusCode).json({
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
    const formattedError = errorFormatter(newApplicantError);
    return res.status(formattedError.httpStatusCode).json({
      message: "An error ocurred creating your application",
      ...formattedError,
    });
  }

  // Email is sent asynchronously through step functions
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
    const formattedError = errorFormatter(error);
    return res.status(formattedError.httpStatusCode).json({
      message: "An error ocurred getting applicant info",
      ...formattedError,
    });
  }
  if (!applicant) {
    return res.status(404).json({ message: "Applicant not found" });
  }
  return res.status(200).json(applicant);
};

export const remove = async (req: Request, res: Response) => {
  const { applicantId } = req.params;

  const [applicant, applicantError] = await Applicants.getApplicantById({
    applicantId,
  });

  if (applicantError) {
    const formattedError = errorFormatter(applicantError);
    return res.status(formattedError.httpStatusCode).json({
      message: "An error ocurred getting applicant info, unable to delete",
      ...formattedError,
    });
  }

  const [success, error] = await Applicants.deleteApplicant({
    orgId: req.session.user.orgId,
    applicantId: applicantId!,
    openingId: applicant.openingId,
    stageId: applicant.stageId,
  });

  if (error) {
    const formattedError = errorFormatter(error);
    return res.status(formattedError.httpStatusCode).json({
      message: "An error ocurred deleting this applicant",
      ...formattedError,
    });
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

  const [success, error] = await Applicants.updateApplicant(
    updateApplicantInput
  );

  if (error) {
    const formattedError = errorFormatter(error);
    return res.status(formattedError.httpStatusCode).json({
      message: "An error ocurred updating this applicant",
      ...formattedError,
    });
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
        questionDescription: Joi.string().allow(null, ""),
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
    const formattedError = errorFormatter(error);
    return res.status(formattedError.httpStatusCode).json({
      message: "An error ocurred retrieving this applicant's information",
      ...formattedError,
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
