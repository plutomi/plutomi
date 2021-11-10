const safeKeys = [
  ,
  "userId",
  "orgId",
  "user_email",
  "firstName",
  "lastName",
  "total_invites",
];

export default function CleanUser(user: DynamoUser) {
  Object.keys(user).forEach(
    (key) => safeKeys.includes(key) || delete user[key]
  );

  return user;
}
