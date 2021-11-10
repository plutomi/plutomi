const safeKeys = [
  ,
  "userId",
  "orgId",
  "userEmail",
  "firstName",
  "lastName",
  "totalInvites",
];

export default function CleanUser(user: DynamoUser) {
  Object.keys(user).forEach(
    (key) => safeKeys.includes(key) || delete user[key]
  );

  return user;
}
