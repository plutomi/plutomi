import { NextApiRequest, NextApiResponse } from "next";
import withAuthorizer from "../../middleware/withAuthorizer";
const secret = process.env.JWT_SECRET;

const handler = async (req: CustomRequest, res: NextApiResponse) => {
  const { body, user } = req;

  return res.status(200).json({ message: "All clear!", user: user });
};

export default withAuthorizer(handler);
