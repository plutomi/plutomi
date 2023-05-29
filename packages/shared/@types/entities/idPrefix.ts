export enum IdPrefix {
  /**
   * These are all lowercase & the truncation may differ from the RelatedTo types
   * as those might be used as keys in the parent object during aggregations.
   */
  USER = "user",
  WAIT_LIST_USER = "wl_user",
  // Time-based One Time Password
  TOTP = "totp",
  SESSION = "session"

  // // ! TODO: Remove
  // NOTE = "note",
  // FILE = "file",
  // INVITE = "invite",
  // TASK = "task",
  // MEMBERSHIP = "membership",
  // ACTIVITY = "activity"
}
