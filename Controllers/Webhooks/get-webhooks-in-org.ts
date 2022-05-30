import { Request, Response } from "express";
import * as CreateError from "../../utils/createError";
import * as Webhooks from "../../models/Webhooks";
const main = async (req: Request, res: Response) => {
  const { session } = res.locals;
  const [webhooks, webhooksError] = await Webhooks.GetWebhooksInOrg({
    orgId: session.orgId,
  });

  if (webhooksError) {
    const { status, body } = CreateError.SDK(
      webhooksError,
      "An error ocurred retrieving webhooks"
    );

    return res.status(status).json(body);
  }

  return res.status(200).json(webhooks);
};
export default main;
