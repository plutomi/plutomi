import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { sealData, unsealData } from "iron-session";
export async function main(
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> {
  console.log(event);
  const cookieName = "plutomi-cookie";
  const sealPw =
    "1asdasdjpojh29oupij3hd98723yuhdf90782hj90372df23907hr9720-3hd09273d9072hhhh9h07dh23907d027398079832hd907h2397h23d";

  // If a cookie by this name exists, extract the seal
  const cookie = event.cookies?.find((cookie) =>
    cookie.includes(cookieName + "=")
  );
  let seal: string;
  if (cookie) {
    seal = cookie.split("=")[1];
  }
  console.log("Seal", seal);

  // Get the encrypted data
  let unsealedData = {};
  if (seal) {
    unsealedData = await unsealData(seal, { password: sealPw });
  }
  console.log("Unsealed data", unsealedData);

  // If there is no seal, generate some random user info
  const user = {
    name: "Jose",
    age: "23",
  };
  const encryptedCookie = await sealData(user, { password: sealPw, ttl: 0 });

  const response: APIGatewayProxyResultV2 = {
    body: JSON.stringify({
      event,
      seal,
      cookieData: unsealedData || "No data in seal",
    }),
    statusCode: 200,
    cookies: [`${cookieName}=${seal || encryptedCookie}; Secure; httpOnly`],
  };
  return response;
}
