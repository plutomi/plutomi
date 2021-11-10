const safeKeys = ["GSI1SK", "stageId", "created_at", "question_order"];

export default function CleanStage(stage: DynamoStage) {
  Object.keys(stage).forEach(
    (key) => safeKeys.includes(key) || delete stage[key]
  );

  return stage;
}
