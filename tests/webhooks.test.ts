import { AXIOS_INSTANCE as axios } from "../Config";
import * as Webhooks from "../adapters/Webhooks";
import * as Orgs from "../adapters/Orgs";
import { nanoid } from "nanoid";
import * as GenerateID from "../utils/generateIds";
import { DynamoOpening, DynamoStage, DynamoWebhook } from "../types/dynamo";
import * as Openings from "../adapters/Openings";
import * as Stages from "../adapters/Stages";
import { APIUpdateWebhookOptions } from "../Controllers/Webhooks/update-webhook";

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
      webhookUrl: "https://google.com",
      webhookName: nanoid(20),
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
        webhookUrl: nanoid(20),
        webhookName: nanoid(20),
      });
    } catch (error) {
      expect(error.response.status).toBe(400);
      expect(error.response.data.message).toContain("body.webhookUrl");
      expect(error.response.data.message).toContain("must be a valid uri");
    }
  });

  it("blocks creating a webhook without a name", async () => {
    expect.assertions(3);
    try {
      await Webhooks.CreateWebhook({
        webhookUrl: "https://google.com",
        webhookName: undefined,
      });
    } catch (error) {
      expect(error.response.status).toBe(400);
      expect(error.response.data.message).toContain("body.webhookName");
      expect(error.response.data.message).toContain("is required");
    }
  });

  it("returns info for a specific webhook", async () => {
    expect.assertions(2);
    const webhookName = nanoid(25);
    await Webhooks.CreateWebhook({
      webhookUrl: "https://google.com",
      webhookName,
    });

    const allWebhooks = await Webhooks.GetWebhooksInOrg();

    const ourWebhook = allWebhooks.data.find(
      (webhook: DynamoWebhook) => webhook.webhookName === webhookName
    );

    const { status, data } = await Webhooks.GetWebhookInfo(
      ourWebhook.webhookId
    );
    expect(status).toBe(200);
    expect(data.webhookName).toBe(webhookName);
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
      webhookUrl: "https://google.com",
      webhookName: name, // This one will be deleted
    });
    await Webhooks.CreateWebhook({
      webhookUrl: "https://google.com",
      webhookName: nanoid(20),
    });

    const originalOrgdata = await Orgs.GetOrgInfo();
    expect(originalOrgdata.data.totalWebhooks).toBe(2);

    const result = await Webhooks.GetWebhooksInOrg();

    const ourWebhook: DynamoWebhook = result.data.find(
      (hook: DynamoWebhook) => hook.webhookName === name
    );

    expect(ourWebhook.webhookName).toBe(name);

    const { status, data } = await Webhooks.DeleteWebhookFromOrg(
      ourWebhook.webhookId
    );

    expect(status).toBe(200);
    expect(data.message).toBe("Webhook deleted!");

    const orgResult = await Orgs.GetOrgInfo();

    expect(orgResult.data.totalWebhooks).toBe(
      originalOrgdata.data.totalWebhooks - 1
    );
  });

  it("allows updating a webhook", async () => {
    expect.assertions(5);
    const ourWebhookName = nanoid(20);
    await Webhooks.CreateWebhook({
      webhookUrl: "https://google.com",
      webhookName: ourWebhookName,
    });

    const allWebhooks = await Webhooks.GetWebhooksInOrg();
    const ourWebhook = allWebhooks.data.find(
      (webhook: DynamoWebhook) => webhook.webhookName === ourWebhookName
    );

    const newValues: APIUpdateWebhookOptions = {
      webhookName: "beans",
      webhookUrl: "https://plutomi.com",
      description: nanoid(40),
    };

    const { status, data } = await Webhooks.UpdateWebhook({
      webhookId: ourWebhook.webhookId,
      newValues,
    });
    expect(status).toBe(200);
    expect(data.message).toBe("Webhook updated!");

    const updatedWebhook = await Webhooks.GetWebhookInfo(ourWebhook.webhookId);
    expect(updatedWebhook.status).toBe(200);
    expect(updatedWebhook.data.webhookId).toBe(ourWebhook.webhookId);
    expect(updatedWebhook.data.description).toBe(newValues.description);
  });

  it("returns a 404 if a webhook is not found", async () => {
    expect.assertions(2);
    try {
      await Webhooks.GetWebhookInfo("beans");
    } catch (error) {
      expect(error.response.status).toBe(404);
      expect(error.response.data.message).toBe("Webhook not found");
    }
  });

  // Used for subsequent tests
  let ourWebhook: DynamoWebhook;
  let ourOpening: DynamoOpening;
  let ourStage: DynamoStage;
  it("allows adding a webhook to a stage and increments the stage and webhook count", async () => {
    expect.assertions(4);

    // Create an opening
    const openingName = nanoid(15);
    await Openings.CreateOpening({
      openingName,
    });
    const openingData = await Openings.GetAllOpeningsInOrg();
    ourOpening = openingData.data.find(
      (opening: DynamoOpening) => opening.openingName === openingName
    );

    // Add a stage to that opening
    await Stages.CreateStage({
      openingId: ourOpening.openingId,
      GSI1SK: nanoid(20),
    });
    const stagesData = await Stages.GetStagesInOpening(ourOpening.openingId);
    ourStage = stagesData.data[0];

    // Create our webhook
    const webhookName = nanoid(20);
    await Webhooks.CreateWebhook({
      webhookName,
      webhookUrl: "https://google.com",
    });
    const webhookData = await Webhooks.GetWebhooksInOrg();
    ourWebhook = await webhookData.data.find(
      (webhook: DynamoWebhook) => webhook.webhookName === webhookName
    );

    // Add it to the stage
    const { status, data } = await Webhooks.AddWebhookToStage({
      openingId: ourOpening.openingId,
      stageId: ourStage.stageId,
      webhookId: ourWebhook.webhookId,
    });
    expect(status).toBe(200);
    expect(data.message).toBe("Webhook added to stage!");

    const updatedStageData = await Stages.GetStageInfo({
      openingId: ourOpening.openingId,
      stageId: ourStage.stageId,
    });
    expect(updatedStageData.data.totalWebhooks).toBe(1);

    const updatedWebhookData = await Webhooks.GetWebhookInfo(
      ourWebhook.webhookId
    );
    expect(updatedWebhookData.data.totalStages).toBe(1);
  });

  it("allows retrieving webhooks for a stage (adjacent item like questions)", async () => {
    expect.assertions(4);

    const { status, data } = await Webhooks.GetWebhooksInStage({
      openingId: ourOpening.openingId,
      stageId: ourStage.stageId,
    });

    // Returns the actual webhook data, not just the array of webhook ids
    // Similar to questions in a stage
    expect(status).toBe(200);
    expect(typeof data).toBe(Array);
    expect(data.length).toBe(1);
    expect(data).toStrictEqual(ourWebhook);
  });

  it("allows deleting a webhook from stage and decrements the stage and webhook count", async () => {
    expect.assertions(2);

    await Webhooks.DeleteWebhookFromStage({
      openingId: ourOpening.openingId,
      stageId: ourStage.stageId,
      webhookId: ourWebhook.webhookId,
    });

    const stageData = await Stages.GetStageInfo({
      openingId: ourOpening.openingId,
      stageId: ourStage.stageId,
    });

    expect(stageData.data.totalWebhooks).toBe(0);

    const webhookData = await Webhooks.GetWebhookInfo(ourWebhook.webhookId);
    expect(webhookData.data.totalStages).toBe(0);
  });

  it.todo("blocks adding more than N webhooks to a stage");
});
