import type { Request, Response } from "express";
import { type z, type AnyZodObject, ZodError } from "zod";

/**
 * Parses a request with the specified Zod schema.
 *
 * https://dev.to/franciscomendes10866/schema-validation-with-zod-and-expressjs-111p#comment-1kn87
 */
export const zParse = async <T extends AnyZodObject>(
  schema: T,
  req: Request,
  res: Response
): Promise<z.infer<T>> => {
  try {
    return await schema.parseAsync(req);
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ message: error.message });
    }
    return res
      .status(400)
      .json({ message: "An error ocurred processing your request", error });
  }
};
