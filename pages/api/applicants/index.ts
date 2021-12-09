import { NextApiRequest, NextApiResponse } from "next";
import { getOpening } from "../../../utils/openings/getOpeningById";
import { createApplicant } from "../../../utils/applicants/createApplicant";
import { API_METHODS, DEFAULTS, EMAILS, ID_LENGTHS } from "../../../Config";
import withValidMethod from "../../../middleware/withValidMethod";
import {
  CreateApplicantAPIResponse,
  CreateApplicantAPIBody,
} from "../../../types/main";

import Joi from "joi";
import withCleanOrgId from "../../../middleware/withCleanOrgId";
import sendEmail from "../../../utils/sendEmail";
const UrlSafeString = require("url-safe-string"),
  tagGenerator = new UrlSafeString();

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
  }: CreateApplicantAPIBody = body;

  // Creates an applicant
  if (method === API_METHODS.POST) {
   
  }
};

export default withCleanOrgId(withValidMethod(handler, [API_METHODS.POST]));
