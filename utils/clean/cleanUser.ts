const safeKeys = []; // TODO have not had to filter any user data just yet

export default function CleanUser(user: DynamoUser) {
  Object.keys(user).forEach(
    (key) => safeKeys.includes(key) || delete safeKeys[key]
  );

  return user;
}
