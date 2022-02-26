import { AXIOS_INSTANCE as axios } from "../Config";
import * as Webhooks from "../adapters/Webhooks";
import * as Orgs from "../adapters/Orgs";
import { nanoid } from "nanoid";
import * as GenerateID from "../utils/generateIds";

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
      SK: nanoid(20),
    });

    expect(status).toBe(201);
    expect(data.message).toBe("Webhook created!");

    const updatedOrgResponse = await Orgs.GetOrgInfo();
    expect(updatedOrgResponse.data.totalWebhooks).toBe(1);
  });

  it("return webhooks for org", async () => {
    expect.assertions(3);

    const { data, status } = await Webhooks.GetWebhooksInOrg();
    console.log(data);

    expect(status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBe(1);
  });

  it("blocks creating a webhook if url is not a url", async () => {
    expect.assertions(3);

    try {
      await Webhooks.CreateWebhook({
        url: nanoid(20),
        SK: nanoid(20),
      });
    } catch (error) {
      expect(error.response.status).toBe(400);
      expect(error.response.data.message).toContain("body.url");
      expect(error.response.data.message).toContain("must be a valid uri");
    }
  });

  it("blocks creating a webhook without a name (SK)", async () => {
    expect.assertions(3);
    try {
      await Webhooks.CreateWebhook({
        url: "https://google.com",
        SK: undefined,
      });
    } catch (error) {
      expect(error.response.status).toBe(400);
      expect(error.response.data.message).toContain("body.SK");
      expect(error.response.data.message).toContain("is required");
    }
  });
});
