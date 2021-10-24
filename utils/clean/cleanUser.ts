const safeKeys = [, "user_id", "org_id", "user_email", "first_name", "last_name"];

export default function CleanUser(user: DynamoUser) {
  Object.keys(user).forEach(
    (key) => safeKeys.includes(key) || delete user[key]
  );

  return user;
}
