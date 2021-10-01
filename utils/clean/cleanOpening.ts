const safeKeys = ["GSI1SK", "opening_id", "created_at", "stage_order"];

export default function CleanOpening(opening: DynamoOpening) {
  Object.keys(opening).forEach(
    (key) => safeKeys.includes(key) || delete opening[key]
  );

  return opening;
}
