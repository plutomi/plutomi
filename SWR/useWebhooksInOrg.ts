import useSWR from "swr";
import { SWRFetcher } from "../Config";
import { GetWebhooksInOrgURL } from "../adapters/Webhooks";
export default function useWebhooksInOrg(orgId?: string) {
  const { data, error } = useSWR(orgId && GetWebhooksInOrgURL(), SWRFetcher);

  return {
    webhooks: data,
    isWebhooksLoading: !error && !data,
    isWebhooksError: error,
  };
}
