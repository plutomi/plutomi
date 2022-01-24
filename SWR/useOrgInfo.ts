import useSWR from "swr";
import { DEFAULTS } from "../Config";
import { GetOrgInfoURL } from "../adapters/Orgs";
import { SWRFetcher } from "../Config";
const UrlSafeString = require("url-safe-string"),
  tagGenerator = new UrlSafeString();

const bannedOrgValues = [
  DEFAULTS.NO_ORG,
  tagGenerator.generate(DEFAULTS.NO_ORG),
];
export default function useOrgInfo(orgId?: string) {
  const shouldFetch = !bannedOrgValues.includes(orgId);

  const { data, error } = useSWR(shouldFetch && GetOrgInfoURL(), SWRFetcher);

  return {
    org: data,
    isOrgLoading: !error && !data,
    isOrgError: error,
  };
}
