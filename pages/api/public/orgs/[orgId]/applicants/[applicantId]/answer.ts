/**
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 * TODO - I think this route should be under /applicants
 */
import { NextApiRequest, NextApiResponse } from "next";
import withCleanOrgId from "../../../../../../../middleware/withCleanOrgId";
import { createApplicantResponse } from "../../../../../../../utils/applicants/createApplicantResponse";
import { API_METHODS } from "../../../../../../../Config";
import withValidMethod from "../../../../../../../middleware/withValidMethod";
import {
  CUSTOM_QUERY,
  CreateApplicantResponseInput,
} from "../../../../../../../types/main";
import Joi from "joi";
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method, query, body } = req;
  const { orgId, applicantId } = query as Pick<
    CUSTOM_QUERY,
    "orgId" | "applicantId"
  >;
  const responses = body.responses;

  // Public route to update limited applicant information, ie: questions & answers
  if (method === API_METHODS.POST) {
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

    try {
      // Write questions to Dynamo
      await Promise.all(
        responses.map(async (response) => {
          const { questionTitle, questionDescription, questionResponse } =
            response;

          const createApplicantResponseInput: CreateApplicantResponseInput = {
            orgId: orgId,
            applicantId: applicantId,
            questionTitle: questionTitle,
            questionDescription: questionDescription,
            questionResponse: questionResponse,
          };

          await createApplicantResponse(createApplicantResponseInput);
        })
      );

      return res
        .status(201)
        .json({ message: `Questions answered succesfully!` });
    } catch (error) {
      return res.status(500).json({
        message: `Unable to answer questions, please try again`,
      });
    }
  }
};

export default withCleanOrgId(withValidMethod(handler, [API_METHODS.POST]));
