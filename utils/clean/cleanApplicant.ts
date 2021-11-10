const safeKeys = [
  "first_name",
  "last_name",
  "created_at",
  "current_openingId",
  "current_openingId",
];

export default function CleanApplicant(applicant: DynamoApplicant) {
  Object.keys(applicant).forEach(
    (key) => safeKeys.includes(key) || delete applicant[key]
  );

  return applicant;
}
