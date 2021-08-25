const bcrypt = require("bcryptjs");
import crypto from "crypto";
const hash_algo = "sha512";
const digest = "hex";

// Create a hash of the user's password using above algo
export async function CreateSHA(user_password: string) {
  const hash = crypto
    .createHash(hash_algo)
    .update(user_password)
    .digest(digest);
  return hash;
}

// Create the main hash with bcrypt
export async function CreatePassword(user_password: string) {
  const SHA = await CreateSHA(user_password);

  const saltRounds = 13;
  const hashed_password = await bcrypt.hashSync(SHA, saltRounds);
  return hashed_password;
}

// Compare user's hash to bcrypt
export async function ComparePassword(user_password: string) {
  // TODO make a call to DB
  const hash = await CreateSHA(user_password);
  const match = await bcrypt.compareSync(
    hash,
    "$2b$15$vb3eOso1rg2hQwiwp0s29Om59sm8PyWQ9.v7kXP0zf/HRHRYVxLLC"
  );

  return match; // true or false
}
