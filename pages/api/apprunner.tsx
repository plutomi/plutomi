import { NextApiRequest, NextApiResponse } from "next";
const secret = process.env.JWT_SECRET;

const handler = async (req: CustomRequest, res: NextApiResponse) => {
  const { body, user } = req;

  return res.status(200).json({ message: "App runner!" });
};

export default handler;
