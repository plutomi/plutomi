import useSWR from "swr";
import { GetWebhookInfoURL } from "../adapters/Webhooks";
import { SWRFetcher } from "../Config";

export default function useWebhookInfo(webhookId: string) {
  const shouldFetch = webhookId ? true : false;

  const { data, error } = useSWR(
    shouldFetch && GetWebhookInfoURL(webhookId),
    SWRFetcher
  );

  return {
    webhook: data,
    isWebhookLoading: !error && !data,
    isWebhookError: error,
  };
}
