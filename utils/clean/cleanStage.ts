const safeKeys = ["GSI1SK", "stage_id", "created_at", "question_order"];

export default function CleanStage(stage: DynamoStage) {
  Object.keys(stage).forEach(
    (key) => safeKeys.includes(key) || delete stage[key]
  );

  return stage;
}
