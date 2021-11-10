const safeKeys = ["GSI1SK", "openingId", "createdAt", "stage_order"];

export default function CleanOpening(opening: DynamoOpening) {
  Object.keys(opening).forEach(
    (key) => safeKeys.includes(key) || delete opening[key]
  );

  return opening;
}
