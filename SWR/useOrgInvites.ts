// Retrieves all invites for a logged in user
import axios from "axios";
import useSWR from "swr";
import InvitesService from "../adapters/InvitesService";
const fetcher = (url: string) => axios.get(url).then((res) => res.data);

/**
 *
 * @param user_id - The ID of the logged in user
 */
function useOrgInvites(user_id: string): useOrgInvitesOutput {
  const shouldFetch = user_id ? true : false;

  const { data, error } = useSWR(
    shouldFetch && InvitesService.getInvitesURL({ user_id }),
    fetcher
  );

  return {
    invites: data,
    isInvitesLoading: !error && !data,
    isInvitesError: error,
  };
}

export default useOrgInvites;
