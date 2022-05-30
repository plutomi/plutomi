import { AXIOS_INSTANCE as axios } from '../Config';
import { APICreateWebhookOptions } from '../Controllers/Webhooks/create-webhook';
import { APIUpdateWebhookOptions } from '../Controllers/Webhooks/update-webhook';

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
const DeleteWebhookFromOrg = async (webhookId: string) => {
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

interface GetWebhooksInStageInput {
  openingId: string;
  stageId: string;
}

export {
  CreateWebhook,
  GetWebhooksInOrg,
  GetWebhooksInOrgURL,
  DeleteWebhookFromOrg,
  UpdateWebhook,
  GetWebhookInfo,
  GetWebhookInfoURL,
};
