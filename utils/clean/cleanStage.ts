const safeKeys = ["GSI1SK", "stageId", "createdAt", "question_order"];

export default function CleanStage(stage: DynamoStage) {
  Object.keys(stage).forEach(
    (key) => safeKeys.includes(key) || delete stage[key]
  );

  return stage;
}
