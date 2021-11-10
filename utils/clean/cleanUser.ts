const safeKeys = [
  ,
  "userId",
  "orgId",
  "user_email",
  "first_name",
  "last_name",
  "total_invites",
];

export default function CleanUser(user: DynamoUser) {
  Object.keys(user).forEach(
    (key) => safeKeys.includes(key) || delete user[key]
  );

  return user;
}
