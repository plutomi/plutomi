// import { APIGatewayProxyResultV2 } from "aws-lambda";
// import { withSessionEvent } from "../../types/main";
// import * as Users from "../../models/Users";
// export async function main(
//   event: withSessionEvent
// ): Promise<APIGatewayProxyResultV2> {
//   const { session } = event.requestContext.authorizer.lambda;

//   return {
//     statusCode: 200,
//     body: JSON.stringify(session),
//   };
// }
