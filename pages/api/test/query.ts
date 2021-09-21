import { NextApiRequest, NextApiResponse } from "next";
import withAuthorizer from "../../../middleware/withAuthorizer";
import { AllByType } from "../../../utils/entityType";
const secret = process.env.JWT_SECRET;

const handler = async (req: CustomRequest, res: NextApiResponse) => {
  const { body, user, query } = req;

  const entity_type = query["entity_type"];

  if (!entity_type) {
    return res.status(400).json({ message: "Missing entity type" });
  }
  try {
    const response = await AllByType(entity_type);
    return res.status(200).json({ response });
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Unable to retrieve entity ${error}` });
  }
  return res.status(200).json({ message: "All clear!" });
};

export default handler;
