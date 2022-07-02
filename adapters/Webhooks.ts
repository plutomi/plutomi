import { AXIOS_INSTANCE as axios } from '../Config';
import { APICreateWebhookOptions } from '../Controllers/Webhooks/createWebhook';
import { APIUpdateWebhookOptions } from '../Controllers/Webhooks/updateWebhook';

export const GetWebhooksInOrgURL = () => `/webhooks`;

export const CreateWebhook = async (options: APICreateWebhookOptions) => {
  const data = await axios.post(GetWebhooksInOrgURL(), { ...options });
  return data;
};

export const GetWebhookInfoURL = (webhookId: string) => `/webhooks/${webhookId}`;

export const GetWebhookInfo = async (webhookId: string) => {
  const data = await axios.get(GetWebhookInfoURL(webhookId));
  return data;
};
export const DeleteWebhookFromOrg = async (webhookId: string) => {
  const data = await axios.delete(GetWebhookInfoURL(webhookId));
  return data;
};

export const GetWebhooksInOrg = async () => {
  const data = await axios.get(GetWebhooksInOrgURL());
  return data;
};

interface UpdateWebhookOptions {
  webhookId: string;
  newValues: APIUpdateWebhookOptions;
}
export const UpdateWebhook = async (options: UpdateWebhookOptions) => {
  const data = await axios.put(GetWebhookInfoURL(options.webhookId), {
    ...options.newValues,
  });
  return data;
};
