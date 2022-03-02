import { AXIOS_INSTANCE as axios } from "../Config";
import { APICreateWebhookOptions } from "../Controllers/Webhooks/create-webhook";
import { APIUpdateWebhookOptions } from "../Controllers/Webhooks/update-webhook";

const GetWebhooksInOrgURL = () => `/webhooks`;

const CreateWebhook = async (options: APICreateWebhookOptions) => {
  const data = await axios.post(GetWebhooksInOrgURL(), { ...options });
  return data;
};

const GetWebhookInfoURL = (webhookId: string) => `/webhooks/${webhookId}`;

const GetWebhookInfo = async (webhookId: string) => {
  const data = await axios.get(GetWebhookInfoURL(webhookId));
  return data;
};
const DeleteWebhook = async (webhookId: string) => {
  const data = await axios.delete(GetWebhookInfoURL(webhookId));
  return data;
};

const GetWebhooksInOrg = async () => {
  const data = await axios.get(GetWebhooksInOrgURL());
  return data;
};

interface UpdateWebhookOptions {
  webhookId: string;
  newValues: APIUpdateWebhookOptions;
}
const UpdateWebhook = async (options: UpdateWebhookOptions) => {
  const data = await axios.put(GetWebhookInfoURL(options.webhookId), {
    ...options.newValues,
  });
  return data;
};

const GetWebhooksInStageUrl = ({ openingId, stageId }) =>
  `/openings/${openingId}/stages/${stageId}/webhooks`;

interface AddWebhookToStageInput {
  openingId: string;
  stageId: string;
  webhookId: string;
}
const AddWebhookToStage = async (options: AddWebhookToStageInput) => {
  const { openingId, stageId, webhookId } = options;
  const data = await axios.post(
    GetWebhooksInStageUrl({
      openingId,
      stageId,
    }),
    {
      openingId,
      stageId,
      webhookId,
    }
  );
  return data;
};

const DeleteWebhookFromStage = async (options: AddWebhookToStageInput) => {
  const { openingId, stageId, webhookId } = options;
  const data = await axios.delete(
    GetWebhooksInStageUrl({
      openingId,
      stageId,
    }) + `/${webhookId}`
  );
  return data;
};

export {
  CreateWebhook,
  GetWebhooksInOrg,
  GetWebhooksInOrgURL,
  DeleteWebhook,
  UpdateWebhook,
  GetWebhookInfo,
  GetWebhookInfoURL,
  AddWebhookToStage,
  DeleteWebhookFromStage,
};
