import useSWR from 'swr';
import { SWRFetcher } from '../Config';
import { GetWebhooksInOrgURL } from '../adapters/Webhooks';
import { DynamoWebhook } from '../types/dynamo';
import { APIErrorResponse } from '../types/main';

interface UseWebhooksInOrgProps {
  orgId?: string;
}
export const useWebhooksInOrg = ({ orgId }: UseWebhooksInOrgProps) => {
  const { data, error } = useSWR<DynamoWebhook[], APIErrorResponse>(
    orgId && GetWebhooksInOrgURL(),
    SWRFetcher,
  );

  return {
    webhooks: data,
    isWebhooksLoading: !error && !data,
    isWebhooksError: error,
  };
};
