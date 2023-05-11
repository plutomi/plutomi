import type { Request, Response } from "express";
import { type z, ZodError, type ZodRawShape, type ZodObject } from "zod";

type ValidationSuccessResult<T extends ZodRawShape> = {
  data: z.infer<ZodObject<T>>;
  errorHandled: false;
};

type ValidationFailureResult = { data: undefined; errorHandled: true };

type ValidateArgs<T extends ZodRawShape> = {
  req: Request;
  res: Response;
  schema: ZodObject<T>;
  /**
   * The data to parse. Defaults to `req.body`.
   */
  data?: any;
};

/**
 * Parses a request with the specified Zod schema.
 *
 * https://dev.to/franciscomendes10866/schema-validation-with-zod-and-expressjs-111p#comment-1kn87
 */

export const zParse: <T extends ZodRawShape>(
  args: ValidateArgs<T>
) => ValidationSuccessResult<T> | ValidationFailureResult = ({
  schema,
  req,
  res,
  data: rawData = req.body
}) => {
  const result = schema.strict().safeParse(rawData);

  if (result.success) {
    return { data: result.data, errorHandled: false };
  }

  const { error } = result;
  const errorHandled = true;

  // if (result.error instanceof ZodError) {
  //   res.status(400).json({ message: error.message });
  //   return { data: undefined, errorHandled };
  // }

  console.log(error.format()._errors.)
  res
    .status(400)
    .json({ message: "An error ocurred processing your request", error });
  return { data: undefined, errorHandled };
};
