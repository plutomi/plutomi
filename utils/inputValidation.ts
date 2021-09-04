export default function InputValidation(input: Object) {
  let missing_keys = [];
  for (const [key, value] of Object.entries(input)) {
    if (value == undefined) {
      missing_keys.push(`'${key}'`);
    }
  }
  if (missing_keys.length > 0)
    throw new Error(`Bad request: ${missing_keys.join(", ")} missing`);
}
