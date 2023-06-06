export const lowercase = (u: unknown) =>
  typeof u === "string" ? u.toLocaleLowerCase() : u;
