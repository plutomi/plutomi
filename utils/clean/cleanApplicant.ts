const safeKeys = [
  "firstName",
  "lastName",
  "created_at",
  "currentOpeningId",
  "currentOpeningId",
];

export default function CleanApplicant(applicant: DynamoApplicant) {
  Object.keys(applicant).forEach(
    (key) => safeKeys.includes(key) || delete applicant[key]
  );

  return applicant;
}
