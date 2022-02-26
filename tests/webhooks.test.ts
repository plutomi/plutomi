import { AXIOS_INSTANCE as axios } from "../Config";
import * as Webhooks from "../adapters/Webhooks";
import * as Orgs from "../adapters/Orgs";
import { nanoid } from "nanoid";
import * as GenerateID from "../utils/generateIds";
import { DynamoWebhook } from "../types/dynamo";

describe("Webhooks", () => {
  /**
   * Creates a session cookie
   */
  beforeAll(async () => {
    const data = await axios.post(`/jest-setup`);
    const cookie = data.headers["set-cookie"][0];
    axios.defaults.headers.Cookie = cookie;
  });

  it("add a webhook to an org and increments the webhook count in the org", async () => {
    expect.assertions(4);
    await Orgs.CreateOrg({
      displayName: nanoid(20),
      orgId: GenerateID.OrgID(20),
    });

    const orgResponse = await Orgs.GetOrgInfo();
    expect(orgResponse.data.totalWebhooks).toBe(0);
    const { data, status } = await Webhooks.CreateWebhook({
      url: "https://google.com",
      name: nanoid(20),
    });

    expect(status).toBe(201);
    expect(data.message).toBe("Webhook created!");

    const updatedOrgResponse = await Orgs.GetOrgInfo();
    expect(updatedOrgResponse.data.totalWebhooks).toBe(1);
  });

  it("return webhooks for org", async () => {
    expect.assertions(3);

    const { data, status } = await Webhooks.GetWebhooksInOrg();

    expect(status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBe(1);
  });

  it("blocks creating a webhook if url is not a url", async () => {
    expect.assertions(3);

    try {
      await Webhooks.CreateWebhook({
        url: nanoid(20),
        name: nanoid(20),
      });
    } catch (error) {
      expect(error.response.status).toBe(400);
      expect(error.response.data.message).toContain("body.url");
      expect(error.response.data.message).toContain("must be a valid uri");
    }
  });

  it("blocks creating a webhook without a name", async () => {
    expect.assertions(3);
    try {
      await Webhooks.CreateWebhook({
        url: "https://google.com",
        name: undefined,
      });
    } catch (error) {
      expect(error.response.status).toBe(400);
      expect(error.response.data.message).toContain("body.name");
      expect(error.response.data.message).toContain("is required");
    }
  });

  it("allows deleting a webhook and decrements the org's total webhooks", async () => {
    expect.assertions(5);
    const name = nanoid(30);

    // New user
    const cookieResult = await axios.post(`/jest-setup`);
    const cookie = cookieResult.headers["set-cookie"][0];
    axios.defaults.headers.Cookie = cookie;
    
    // New org
    await Orgs.CreateOrg({
      displayName: nanoid(20),
      orgId: GenerateID.OrgID(20),
    });

    // Create two webhooks
    await Webhooks.CreateWebhook({
      url: "https://google.com",
      name, // This one will be deleted
    });
    await Webhooks.CreateWebhook({
      url: "https://google.com",
      name: nanoid(20),
    });

    const originalOrgdata = await Orgs.GetOrgInfo();
    expect(originalOrgdata.data.totalWebhooks).toBe(2);

    const result = await Webhooks.GetWebhooksInOrg();

    const ourWebhook: DynamoWebhook = result.data.find(
      (hook: DynamoWebhook) => hook.name === name
    );

    expect(ourWebhook.name).toBe(name);

    const { status, data } = await Webhooks.DeleteWebhook(ourWebhook.webhookId);

    expect(status).toBe(200);
    expect(data.message).toBe("Webhook deleted!");

    const orgResult = await Orgs.GetOrgInfo();

    expect(orgResult.data.totalWebhooks).toBe(
      originalOrgdata.data.totalWebhooks - 1
    );
  });
});
