const safeKeys = [
  "firstName",
  "lastName",
  "createdAt",
  "currentOpeningId",
  "currentOpeningId",
];

export default function cleanApplicant(applicant) {
  Object.keys(applicant).forEach(
    (key) => safeKeys.includes(key) || delete applicant[key]
  );

  return applicant;
}
