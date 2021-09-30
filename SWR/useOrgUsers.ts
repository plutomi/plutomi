// Retrieves all users in an org
import axios from "axios";
import useSWR from "swr";

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

/**
 *
 * @param org_id The org which you want to look up the users for
 * @param user_id - The ID of the logged in user
 * @returns
 */
function useOrgUsers(org_id: string, user_id: string): useOrgUsersOutput {
  const shouldFetch = org_id && user_id ? true : false;

  const { data, error } = useSWR(
    shouldFetch && `/api/orgs/${org_id}/users`,
    fetcher
  );

  return {
    orgUsers: data,
    isOrgUsersLoading: !error && !data,
    isOrgUsersError: error,
  };
}

export default useOrgUsers;
