import { NextApiRequest, NextApiResponse } from "next";

export default function withAuthorizer(handler: any) {
  return async (req: NextApiRequest, res: NextApiResponse) => {};
}
