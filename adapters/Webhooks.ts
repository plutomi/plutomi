import { AXIOS_INSTANCE as axios } from "../Config";
import { APICreateWebhookOptions } from "../Controllers/Webhooks/create-webhook";

const GetWebhooksInOrgURL = () => `/webhooks`;

const CreateWebhook = async (options: APICreateWebhookOptions) => {
  const data = await axios.post(GetWebhooksInOrgURL(), { ...options });
  return data;
};

const GetWebhooksInOrg = async () => {
  const data = await axios.get(GetWebhooksInOrgURL());
  return data;
};

export { CreateWebhook, GetWebhooksInOrg, GetWebhooksInOrgURL };
