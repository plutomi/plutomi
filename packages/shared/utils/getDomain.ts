type GetDomainProps = {
  url: string;
  /**
   *
   * If passed in `https://staging.plutomi.com`, will return `staging.plutomi.com`.
   * Does not
   * @default false
   */
  removeSubdomain?: boolean;
};

/**
 * Given a URL, return the domain with or without the subdomain.
 * Did not test for multiple subdomains OR multiple suffixes. Not relevant for our use case.
 */
export const getDomain = ({ url, removeSubdomain = false }: GetDomainProps) => {
  let response = new URL(url).hostname;

  if (removeSubdomain) {
    response = response.split(".").slice(-2).join(".");
  }
  return response;
};
