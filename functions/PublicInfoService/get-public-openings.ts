import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";

export async function main(
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> {
  console.log("event 👉", event);
  console.log("region 👉", process.env.REGION);
  console.log("availability zones 👉", process.env.AVAILABILITY_ZONES);

  return {
    body: JSON.stringify({ message: "SUCCESS 🎉" }),
    statusCode: 200,
  };
}
