const safeKeys = [
  ,
  "userId",
  "orgId",
  "userEmail",
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
