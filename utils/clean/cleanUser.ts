const safeKeys = [, "user_id", "org_id", "user_email"];

export default function CleanUser(user: DynamoUser) {
  Object.keys(user).forEach(
    (key) => safeKeys.includes(key) || delete user[key]
  );

  return user;
}
