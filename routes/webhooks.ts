import { Router } from 'express';
import API from '../Controllers';
import withHasOrg from '../middleware/withHasOrg';
import withSession from '../middleware/withSession';

export const webhooks = Router();

webhooks.use(withSession);
webhooks.use(withHasOrg);

webhooks.post('', API.Webhooks.createWebhook);
webhooks.get('', API.Webhooks.getWebhooksInOrg);
webhooks.delete('/:webhookId', API.Webhooks.deleteWebhook);
webhooks.get('/:webhookId', API.Webhooks.getWebhook);
webhooks.put('/:webhookId', API.Webhooks.updateWebhook);
