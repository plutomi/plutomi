import { Request, Response } from 'express';
import { env } from '../../env';
import { DB } from '../../models';

export const healthCheck = async (req: Request, res: Response) => {
  console.log(`Health check hit, trying to get org`);
  // TODO remove
  return res.status(200).json({ message: 'TODO Endpoint temporarily disabled!' });

  // try {
  //   const org = await DB.Orgs.getOrg({
  //     orgId: 'beans',
  //   });
  //   console.log(`Got org!`, org);
  //   return res.status(200).json({
  //     message: "It's all good man!",
  //     env: `COMMITS_TOKEN: ${env.commitsToken}`,
  //     org,
  //   });
  // } catch (error) {
  //   console.error(`Error ocurred getting org`, error);
  //   return res.status(500).json({ message: 'Error ocurred getting org', error });
  // }
};
