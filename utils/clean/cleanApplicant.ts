const safeKeys = [
  "firstName",
  "lastName",
  "createdAt",
  "currentOpeningId",
  "currentOpeningId",
];

export default function CleanApplicant(applicant: DynamoApplicant) {
  Object.keys(applicant).forEach(
    (key) => safeKeys.includes(key) || delete applicant[key]
  );

  return applicant;
}
