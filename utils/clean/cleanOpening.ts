const safeKeys = ["GSI1SK", "openingId", "createdAt", "stageOrder"];

export default function cleanOpening(opening) {
  Object.keys(opening).forEach(
    (key) => safeKeys.includes(key) || delete opening[key]
  );

  return opening;
}
