import useSWR from 'swr';
import { GetPublicOpeningsURL } from '../.vscode/adapters/PublicInfo';
import { SWRFetcher } from '../../Config';
import { DynamoOpening } from '../@types/dynamo';
import { APIErrorResponse } from '../../@types/express';

interface UseAllPublicOpeningsProps {
  orgId?: string;
}
export const useAllPublicOpenings = ({ orgId }: UseAllPublicOpeningsProps) => {
  const { data, error } = useSWR<DynamoOpening[], APIErrorResponse>(
    orgId && GetPublicOpeningsURL(orgId),
    SWRFetcher,
  );

  return {
    publicOpenings: data,
    isPublicOpeningsLoading: !error && !data,
    isPublicOpeningsError: error,
  };
};