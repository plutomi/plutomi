const banned_keys = ["password"];

/**
 * @param object - Removes certain keys from an object so that they are never sent to the front end
 */
export function SanitizeResponse(object: Object) {
  banned_keys.forEach((key) => {
    delete object[key];
  });
}
