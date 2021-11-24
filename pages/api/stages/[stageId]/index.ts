import { getStageById } from "../../../../utils/stages/getStageById";
import { NextApiRequest, NextApiResponse } from "next";
import { deleteStage } from "../../../../utils/stages/deleteStage";
import updateStage from "../../../../utils/stages/updateStage";
// Create stage in a opening
import { withSessionRoute } from "../../../../middleware/withSession";
import { API_METHODS } from "../../../../Config";
import withAuth from "../../../../middleware/withAuth";
import withCleanOrgId from "../../../../middleware/withCleanOrgId";
import withValidMethod from "../../../../middleware/withValidMethod";
import { CUSTOM_QUERY, UpdateStageInput } from "../../../../types/main";
import Joi from "joi";

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  const { method, query, body } = req;
  const { stageId } = query as Pick<CUSTOM_QUERY, "stageId">;
  // Get a single stage in an opening
  if (method === API_METHODS.GET) {
    const getStageInput = {
      orgId: req.session.user.orgId,
      stageId: stageId,
    };

    try {
      const stage = await getStageById(getStageInput);
      if (!stage) {
        return res.status(404).json({ message: "Stage not found" });
      }

      return res.status(200).json(stage);
    } catch (error) {
      // TODO add error logger
      return res
        .status(400) // TODO change #
        .json({ message: `Unable to retrieve stage: ${error}` });
    }
  }

  if (method === API_METHODS.PUT) {
    try {
      const updateStageInput: UpdateStageInput = {
        orgId: req.session.user.orgId,
        stageId: stageId,
        newStageValues: body.newStageValues,
      };

      const schema = Joi.object({
        orgId: Joi.string(),
        stageId: Joi.string(),
        newStageValues: Joi.object(), // TODo add actual inputs of new stage values
      }).options({ presence: "required" });

      // Validate input
      try {
        await schema.validateAsync(updateStageInput);
      } catch (error) {
        return res.status(400).json({ message: `${error.message}` });
      }

      await updateStage(updateStageInput);
      return res.status(200).json({ message: "Stage updated!" });
    } catch (error) {
      return res
        .status(500)
        .json({ message: `Unable to update stage - ${error}` });
    }
  }

  if (method === API_METHODS.DELETE) {
    try {
      const deleteStageInput = {
        orgId: req.session.user.orgId,
        stageId: stageId,
      };

      await deleteStage(deleteStageInput);

      return res.status(200).json({ message: "Stage deleted!" });
    } catch (error) {
      // TODO add error logger
      return res
        .status(400) // TODO change #
        .json({ message: `Unable to delete your stage: ${error}` });
    }
  }
};

export default withCleanOrgId(
  withValidMethod(withSessionRoute(withAuth(handler)), [
    API_METHODS.GET,
    API_METHODS.PUT,
    API_METHODS.DELETE,
  ])
);
