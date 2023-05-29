// ! TODO: Rename this to ID prefix
export enum IdPrefix {
  /**
   * These are all lowercase because they are used in URLs as IDs. The truncation may differ from the RelatedTo types.
   */
  USER = "user",
  WAIT_LIST_USER = "wl_user",
  // Time-based One Time Password
  TOTP = "totp",
  SESSION = "session",

  // ! TODO: Remove
  NOTE = "note",
  FILE = "file",
  INVITE = "invite",
  TASK = "task",
  MEMBERSHIP = "membership",
  ACTIVITY = "activity"
}
