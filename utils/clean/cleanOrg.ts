const safeKeys = ["GSI1SK", "org_id"];

export default function CleanOrg(org: DynamoOrg) {
  Object.keys(org).forEach((key) => safeKeys.includes(key) || delete org[key]);

  return org;
}
