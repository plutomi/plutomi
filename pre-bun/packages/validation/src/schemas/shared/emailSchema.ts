import { z } from "zod";
import { trimAndLowerCase } from "../utils";

export const emailSchema = z.preprocess(
  trimAndLowerCase,
  z
    .string({
      required_error: "Email is required"
    })
    .email("That email doesn't look right...")
);
