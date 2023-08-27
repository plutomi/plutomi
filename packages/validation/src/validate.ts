import type { Request, Response } from "express";
import type { z, ZodRawShape, ZodObject } from "zod";

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

export const validate: <T extends ZodRawShape>(
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
  // TODO: This is 'issues' now?
  const errorHandled = true;

  res.status(400).json({
    message: (error.errors[0] ?? { message: "An error ocurred" }).message
  });
  return { data: undefined, errorHandled };
};
