// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { a } from '@plutomi/shared';

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ name: string }>
) {
  res.status(200).json({ name: a });
}
