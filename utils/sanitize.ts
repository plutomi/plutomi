/**
 *
 * @param action Whether to `REMOVE` or `KEEP` the listed properties
 * @param properties The properties to filter on
 * @param object The object that you want to remove or keep certain keys
 * @returns An object with certain keys remove or kept
 */
export default function Sanitize(
  action: "REMOVE" | "KEEP",
  properties: string[],
  object: {}
) {
  let removedKeys = [];
  for (const key in object) {
    const rule =
      action === "REMOVE"
        ? properties.includes(key)
        : !properties.includes(key);

    if (rule) {
      delete object[key];
      removedKeys.push(key);
    }
  }

  return { object, removedKeys };
}
