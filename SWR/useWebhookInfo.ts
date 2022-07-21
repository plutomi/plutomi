import useSWR from 'swr';
import { GetWebhookInfoURL } from '../adapters/Webhooks';
import { SWRFetcher } from '../Config';
import { DynamoWebhook } from '../types/dynamo';
import { APIErrorResponse } from '../types/main';

interface UseWebhookInfoProps {
  webhookId?: string;
}

export const useWebhookInfo = ({ webhookId }: UseWebhookInfoProps) => {
  const { data, error } = useSWR<DynamoWebhook, APIErrorResponse>(
    webhookId && GetWebhookInfoURL(webhookId),
    SWRFetcher,
  );

  return {
    webhook: data,
    isWebhookLoading: !error && !data,
    isWebhookError: error,
  };
};
