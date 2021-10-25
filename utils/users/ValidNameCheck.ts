/**
 * Checks if a user's desired name includes NO_FIRST_NAME or NO_LAST_NAME
 * @param object - Incoming keys to be updated
 * @returns
 */
export default function ValidNameCheck(object: any) {
  if (
    object.hasOwnProperty(":first_name") &&
    (object[":first_name"] === "NO_FIRST_NAME" ||
      object[":GSI1SK"].includes("NO_FIRST_NAME"))
  ) {
    throw "Invalid first name";
  }

  if (
    object.hasOwnProperty(":last_name") &&
    (object[":last_name"] === "NO_LAST_NAME" ||
      object[":GSI1SK"].includes("NO_LAST_NAME"))
  ) {
    throw "Invalid last name";
  }

  return;
}
