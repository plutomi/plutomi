export default function InputValidation(input: Object) {
  let missingKeys = [];
  for (const [key, value] of Object.entries(input)) {
    if (value == undefined) {
      missingKeys.push(`'${key}'`);
    }
  }
  if (missingKeys.length > 0)
    throw `Bad request: ${missingKeys.join(", ")} missing`;
}
