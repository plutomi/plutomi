import Joi from "@hapi/joi";
import { APIGatewayProxyEventV2 } from "aws-lambda";
import FormattedResponse from "../utils/formatResponse";
// TODO USING LAMBDA HANDLERS!!!
/**
 *
 * @param handler The handler of your function
 * @param schema A Joi schema to validate your event.body against
 */
export default function withInputValidation(handler: any, schema: Joi.Schema) {
  return async (event: APIGatewayProxyEventV2) => {
    if (!event.body) {
      return FormattedResponse(400, { message: "Request `body` is missing" });
    }

    const body = JSON.parse(event.body);

    try {
      await schema.validateAsync(body);
      return handler(event);
    } catch (error) {
      return FormattedResponse(400, { message: error.message });
    }
  };
}
