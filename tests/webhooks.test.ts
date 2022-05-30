import { nanoid } from 'nanoid';
import { AXIOS_INSTANCE as axios } from '../Config';
import * as Webhooks from '../adapters/Webhooks';
import * as Orgs from '../adapters/Orgs';
import * as GenerateID from '../utils/generateIds';

import { APIUpdateWebhookOptions } from '../Controllers/Webhooks/updateWebhook';
import { DynamoWebhook } from '../types/dynamo';

describe('Webhooks', () => {
  /**
   * Creates a session cookie
   */
  beforeAll(async () => {
    const data = await axios.post(`/jest-setup`);
    const cookie = data.headers['set-cookie'][0];
    axios.defaults.headers.Cookie = cookie;
  });

  it('add a webhook to an org and increments the webhook count in the org', async () => {
    expect.assertions(4);
    await Orgs.CreateOrg({
      displayName: nanoid(20),
      orgId: GenerateID.OrgID(20),
    });

    const orgResponse = await Orgs.GetOrgInfo();
    expect(orgResponse.data.totalWebhooks).toBe(0);
    const { data, status } = await Webhooks.CreateWebhook({
      webhookUrl: 'https://google.com',
      webhookName: nanoid(20),
    });

    expect(status).toBe(201);
    expect(data.message).toBe('Webhook created!');

    const updatedOrgResponse = await Orgs.GetOrgInfo();
    expect(updatedOrgResponse.data.totalWebhooks).toBe(1);
  });

  it('return webhooks for org', async () => {
    expect.assertions(3);

    const { data, status } = await Webhooks.GetWebhooksInOrg();

    expect(status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBe(1);
  });

  it('blocks creating a webhook if url is not a url', async () => {
    expect.assertions(3);

    try {
      await Webhooks.CreateWebhook({
        webhookUrl: nanoid(20),
        webhookName: nanoid(20),
      });
    } catch (error) {
      expect(error.response.status).toBe(400);
      expect(error.response.data.message).toContain('body.webhookUrl');
      expect(error.response.data.message).toContain('must be a valid uri');
    }
  });

  it('blocks creating a webhook without a name', async () => {
    expect.assertions(3);
    try {
      await Webhooks.CreateWebhook({
        webhookUrl: 'https://google.com',
        webhookName: undefined,
      });
    } catch (error) {
      expect(error.response.status).toBe(400);
      expect(error.response.data.message).toContain('body.webhookName');
      expect(error.response.data.message).toContain('is required');
    }
  });

  it('returns info for a specific webhook', async () => {
    expect.assertions(2);
    const webhookName = nanoid(25);
    await Webhooks.CreateWebhook({
      webhookUrl: 'https://google.com',
      webhookName,
    });

    const allWebhooks = await Webhooks.GetWebhooksInOrg();

    const ourWebhook = allWebhooks.data.find(
      (webhook: DynamoWebhook) => webhook.webhookName === webhookName,
    );

    const { status, data } = await Webhooks.GetWebhookInfo(ourWebhook.webhookId);
    expect(status).toBe(200);
    expect(data.webhookName).toBe(webhookName);
  });
  it("allows deleting a webhook and decrements the org's total webhooks", async () => {
    expect.assertions(5);
    const name = nanoid(30);

    // New user
    const cookieResult = await axios.post(`/jest-setup`);
    const cookie = cookieResult.headers['set-cookie'][0];
    axios.defaults.headers.Cookie = cookie;

    // New org
    await Orgs.CreateOrg({
      displayName: nanoid(20),
      orgId: GenerateID.OrgID(20),
    });

    // Create two webhooks
    await Webhooks.CreateWebhook({
      webhookUrl: 'https://google.com',
      webhookName: name, // This one will be deleted
    });
    await Webhooks.CreateWebhook({
      webhookUrl: 'https://google.com',
      webhookName: nanoid(20),
    });

    const originalOrgdata = await Orgs.GetOrgInfo();
    expect(originalOrgdata.data.totalWebhooks).toBe(2);

    const result = await Webhooks.GetWebhooksInOrg();

    const ourWebhook: DynamoWebhook = result.data.find(
      (hook: DynamoWebhook) => hook.webhookName === name,
    );

    expect(ourWebhook.webhookName).toBe(name);

    const { status, data } = await Webhooks.DeleteWebhookFromOrg(ourWebhook.webhookId);

    expect(status).toBe(200);
    expect(data.message).toBe('Webhook deleted!');

    const orgResult = await Orgs.GetOrgInfo();

    expect(orgResult.data.totalWebhooks).toBe(originalOrgdata.data.totalWebhooks - 1);
  });

  it('allows updating a webhook', async () => {
    expect.assertions(5);
    const ourWebhookName = nanoid(20);
    await Webhooks.CreateWebhook({
      webhookUrl: 'https://google.com',
      webhookName: ourWebhookName,
    });

    const allWebhooks = await Webhooks.GetWebhooksInOrg();
    const ourWebhook = allWebhooks.data.find(
      (webhook: DynamoWebhook) => webhook.webhookName === ourWebhookName,
    );

    const newValues: APIUpdateWebhookOptions = {
      webhookName: 'beans',
      webhookUrl: 'https://plutomi.com',
      description: nanoid(40),
    };

    const { status, data } = await Webhooks.UpdateWebhook({
      webhookId: ourWebhook.webhookId,
      newValues,
    });
    expect(status).toBe(200);
    expect(data.message).toBe('Webhook updated!');

    const updatedWebhook = await Webhooks.GetWebhookInfo(ourWebhook.webhookId);
    expect(updatedWebhook.status).toBe(200);
    expect(updatedWebhook.data.webhookId).toBe(ourWebhook.webhookId);
    expect(updatedWebhook.data.description).toBe(newValues.description);
  });

  it('returns a 404 if a webhook is not found', async () => {
    expect.assertions(2);
    try {
      await Webhooks.GetWebhookInfo('beans');
    } catch (error) {
      expect(error.response.status).toBe(404);
      expect(error.response.data.message).toBe('Webhook not found');
    }
  });
});
