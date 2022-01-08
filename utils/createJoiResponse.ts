import { APIGatewayProxyResultV2 } from "aws-lambda";

export default function createJoiResponse(error): APIGatewayProxyResultV2 {
  return {  
    statusCode: 400,
    body: JSON.stringify({ message: `${error.message}` }),
  };
}
