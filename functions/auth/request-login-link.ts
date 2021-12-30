import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
export async function main(
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> {
  console.log(event);

  const response: APIGatewayProxyResultV2 = {
    body: JSON.stringify({
      event,
    }),
    statusCode: 200,
  };
  return response;
}
