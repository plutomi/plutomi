import { AXIOS_INSTANCE as axios } from "../Config";
import * as Webhooks from "../adapters/Webhooks";
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
    const { data, status } = await Webhooks.CreateWebhook({
      url: "https://google.com",
    });

    expect(status).toBe(201);
    expect(data.message).toBe("Webhook created");
  });

  it("return webhook for org", async () => {
    expect.assertions(3);

    const { data, status } = await Webhooks.GetAllWebhooksInOrg();

    expect(status).toBe(200);
    expect(typeof data).toBe(Array);
    expect(data.length).toBe(1);
  });
});
