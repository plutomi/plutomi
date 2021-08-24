import { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { body, method } = req;
  const { new_user } = body;

  if (method === "POST") {
    return res.status(200).json({ message: "received" });
  }

  return res.status(405).json({ message: "Not Allowed" });
};

export default handler;
