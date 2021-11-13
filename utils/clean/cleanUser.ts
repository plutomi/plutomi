const safeKeys = [
  ,
  "userId",
  "orgId",
  "userEmail",
  "firstName",
  "lastName",
  "totalInvites",
];

export default function cleanUser(user) {
  Object.keys(user).forEach(
    (key) => safeKeys.includes(key) || delete user[key]
  );

  return user;
}
