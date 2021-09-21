import { NextApiRequest, NextApiResponse } from "next";
import withAuthorizer from "../../../middleware/withAuthorizer";
import { AllByType } from "../../../utils/entityType";
const secret = process.env.JWT_SECRET;

const handler = async (req: CustomRequest, res: NextApiResponse) => {
  const { body, user, query, params } = req;

  try {
    const users = await AllByType("USER");

    return res.status(200).json(users);
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Unable to retrieve entity ${error}` });
  }
};

export default handler;
