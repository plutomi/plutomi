/* eslint no-console: 0 */

import * as dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const schema = z.object({
  PORT: z.coerce.number().int().positive().gte(1024).lte(65535),
  NODE_ENV: z.enum(["development", "production"])
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  parsed.error.issues.forEach((issue) => {
    console.error("\n❌ Invalid environment variable:");
    console.error(issue);
  });

  process.exit(1);
}
export const env = parsed.data;

const myFunction = (x,y) => {return x+y;}
const myArray = [1,2,3,4,5];
myArray.map( num => {
  return num*2;
});