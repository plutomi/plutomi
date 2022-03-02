import useSWR from "swr";
import { SWRFetcher } from "../Config";
import { GetWebhooksInStageURL } from "../adapters/Webhooks";
export default function useWebhooksInOrg(stageId: string, openingId: string) {
  const shouldFetch = stageId && openingId;
  const { data, error } = useSWR(
    shouldFetch && GetWebhooksInStageURL({ openingId, stageId }),
    SWRFetcher
  );

  return {
    webhooks: data,
    isWebhooksLoading: !error && !data,
    isWebhooksError: error,
  };
}
