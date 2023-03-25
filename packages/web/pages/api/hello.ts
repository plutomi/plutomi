// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import type { RandomType } from '@plutomi/shared';

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<RandomType>
) {
  res.status(200).json({ name: 'John Doe' });
}
