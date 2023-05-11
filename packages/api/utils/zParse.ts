import type { Request, Response } from "express";
import { type z, ZodError, type ZodRawShape, type ZodObject } from "zod";

type ValidationSuccessResult<T extends ZodRawShape> = {
  data: z.infer<ZodObject<T>>;
  errorHandled: false;
};

type ValidationFailureResult = { data: undefined; errorHandled: true };

/**
 * Parses a request with the specified Zod schema.
 *
 * https://dev.to/franciscomendes10866/schema-validation-with-zod-and-expressjs-111p#comment-1kn87
 */
export const zParse = <T extends ZodRawShape>(
  req: Request,
  res: Response,
  schema: ZodObject<T>
): ValidationSuccessResult<T> | ValidationFailureResult => {
  try {
    const result = schema.strict().parse(req);

    return { data: result, errorHandled: false };
  } catch (error) {
    const errorHandled = true;

    if (error instanceof ZodError) {
      res.status(400).json({ message: error.message });
      return { data: undefined, errorHandled };
    }
    res
      .status(400)
      .json({ message: "An error ocurred processing your request", error });
    return { data: undefined, errorHandled };
  }
};
