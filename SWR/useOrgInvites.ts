// Retrieves all invites for a logged in user
import axios from "axios";
import useSWR from "swr";

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

/**
 *
 * @param user_id - The ID of the logged in user
 */
function useOrgInvites(user_id: string): useOrgInvitesOutput {
  const shouldFetch = user_id ? true : false;

  const { data, error } = useSWR(
    shouldFetch && `/api/users/${user_id}/invites`,
    fetcher
  );

  return {
    invites: data,
    isInvitesLoading: !error && !data,
    isInvitesError: error,
  };
}

export default useOrgInvites;
