const bcrypt = require("bcryptjs");
import crypto from "crypto";
const hash_algo = "sha512";
const digest = "hex";

import { GetUserByEmail } from "./users/getUserByEmail";
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
export async function VerifyPassword(
  user_email: string,
  user_password: string
) {
  const hash = await CreateSHA(user_password);
  const user = await GetUserByEmail(user_email);

  if (!user) {
    throw new Error("User not found");
  }
  const match = await bcrypt.compareSync(hash, user.password);

  return match; // true or false
}
