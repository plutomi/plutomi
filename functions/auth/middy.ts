import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import httpEventNormalizer from "@middy/http-event-normalizer";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import httpSecurityHeaders from "@middy/http-security-headers";
import { JOI_SETTINGS } from "../../Config";
import Joi from "joi";
import middy from "@middy/core";
const schema = Joi.object({
  body: {
    name: Joi.string(),
  },
  queryStringParameters: {
    beans: Joi.string(),
  },
}).options(JOI_SETTINGS);

const main = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => {
  console.log(event);
  try {
    await schema.validateAsync(event);
  } catch (error) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: `${error.message}` }),
    };
  }

  return JSON.stringify({
    statusCode: 200,
    body: event,
  });
};

module.exports.main = middy(main)
  .use(httpEventNormalizer({ payloadFormatVersion: 2 }))
  .use(httpJsonBodyParser())
  .use(httpSecurityHeaders());
