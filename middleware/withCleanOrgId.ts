import { Request, Response, NextFunction } from 'express';
import TagGenerator from '../utils/tagGenerator';

/**
 * Cleans up the orgId, whether in body, params, or query, to be URL safe
 */
export default async function withCleanOrgId(req: Request, res: Response, next: NextFunction) {
  if (req.body.orgId) {
    try {
      req.body.orgId = TagGenerator({ value: req.body.orgId });
    } catch (error) {
      const message = `An error ocurred parsing req.body.orgId - ${error}`;
      return res.status(400).json({ message });
    }
  }

  if (req.params.orgId) {
    try {
      req.params.orgId = TagGenerator({ value: req.params.orgId });
    } catch (error) {
      const message = `An error ocurred parsing req.params.orgId - ${error}`;
      return res.status(400).json({ message });
    }
  }

  if (req.query.orgId) {
    try {
      req.query.orgId = TagGenerator({ value: req.query.orgId as string });
    } catch (error) {
      const message = `An error ocurred parsing req.query.orgId - ${error}`;
      return res.status(400).json({ message });
    }
  }

  next();
}
