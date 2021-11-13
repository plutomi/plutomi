const safeKeys = ["GSI1SK", "stageId", "createdAt", "questionOrder"];

export default function CleanStage(stage: DynamoStage) {
  Object.keys(stage).forEach(
    (key) => safeKeys.includes(key) || delete stage[key]
  );

  return stage;
}
