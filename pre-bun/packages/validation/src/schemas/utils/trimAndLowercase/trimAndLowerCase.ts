export const trimAndLowerCase = (u: unknown) =>
  typeof u === "string" ? u.trim().toLocaleLowerCase() : u;
