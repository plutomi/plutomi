// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
// import { Result } from '@/../shared' // ! TODO Add rule to not import across packages
// import { Result } from '@plutomi/shared';
import { Result } from "@/../shared";
import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Result>
) {
  res.status(200).json({ name: "John De" });
}
