const safeKeys = ["GSI1SK", "orgId"];

export default function CleanOrg(org: DynamoOrg) {
  Object.keys(org).forEach((key) => safeKeys.includes(key) || delete org[key]);

  return org;
}
