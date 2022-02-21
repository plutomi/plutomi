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

  it("add a webhook to an org", async () => {
    expect.assertions(2);
    await Orgs.CreateOrg({
      displayName: nanoid(20),
      orgId: GenerateID.OrgID(20),
    });
    const { data, status } = await Webhooks.CreateWebhook({
      url: "https://google.com",
    });

    expect(status).toBe(201);
    expect(data.message).toBe("Webhook created!");
  });

  it("return webhooks for org", async () => {
    expect.assertions(3);

    const { data, status } = await Webhooks.GetAllWebhooksInOrg();
    console.log(data);

    expect(status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBe(1);
  });
});
