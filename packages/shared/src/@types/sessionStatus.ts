export enum SessionStatus {
  ACTIVE = "ACTIVE",
  LOGGED_OUT = "LOGGED_OUT",
  EXPIRED = "EXPIRED",
  REVOKED = "REVOKED",
  // This doesn't necessarily invalidate the session, but it does invalidate the user's ability to use the session.
  // They are granted a new one when they create a new workspace.
  SWITCHED_WORKSPACE = "SWITCHED_WORKSPACE"
}
