import { Request, Response, NextFunction } from 'express';
import TagGenerator from '../utils/tagGenerator';
/**
 * Cleans up the webhoookId, whether in body, params, or query, to be URL safe
 */
// eslint-disable-next-line consistent-return
export default async function withCleanWebhookId(req: Request, res: Response, next: NextFunction) {
  if (req.body.webhoookId) {
    try {
      req.body.webhoookId = TagGenerator({
        value: req.body.webhoookId,
        joinString: '_',
      });
    } catch (error) {
      const message = `An error ocurred parsing req.body.webhookId - ${error}`;
      return res.status(400).json({ message });
    }
  }

  if (req.params.webhoookId) {
    try {
      req.params.webhoookId = TagGenerator({
        value: req.params.webhoookId,
        joinString: '_',
      });
    } catch (error) {
      const message = `An error ocurred parsing req.params.webhookId - ${error}`;
      return res.status(400).json({ message });
    }
  }

  if (req.query.webhoookId) {
    try {
      req.query.webhoookId = TagGenerator({
        value: req.params.webhoookId,
        joinString: '_',
      });
    } catch (error) {
      const message = `An error ocurred parsing req.query.webhookId - ${error}`;
      return res.status(400).json({ message });
    }
  }

  next();
}
