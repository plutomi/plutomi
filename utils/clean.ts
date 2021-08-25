const banned_keys = ["password"];

/**
 * @param object - Removes certain keys from the object so that they are never sent to the front end
 */
export function Clean(object: Object) {
  banned_keys.forEach((key) => {
    delete object[key];
  });
}
