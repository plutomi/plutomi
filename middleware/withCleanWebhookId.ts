import { Request, Response, NextFunction } from 'express';
import TagGenerator from '../utils/tagGenerator';
/**
 * Cleans up the webhoookId, whether in body, params, or query, to be URL safe
 */
// eslint-disable-next-line consistent-return
export default async function withCleanWebhookId(req: Request, res: Response, next: NextFunction) {
  if (req.body.webhoookId) {
    req.body.webhoookId = TagGenerator({
      value: req.body.webhoookId,
      joinString: '_',
    });
  }

  if (req.params.webhoookId) {
    req.params.webhoookId = TagGenerator({
      value: req.params.webhoookId,
      joinString: '_',
    });
  }

  if (req.query.webhoookId) {
    req.query.webhoookId = TagGenerator({
      value: req.params.webhoookId,
      joinString: '_',
    });
  }

  next();
}
