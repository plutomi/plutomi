import middy from "@middy/core";
import { APIGatewayProxyEventV2 } from "aws-lambda";
import { lambdaAuthorizerMiddleware } from "../../Config";

const main = async (event: APIGatewayProxyEventV2) => {
  console.log("In authorizer: ", event);
  //   const [session, sessionError] = await getSessionFromCookies(event);
  //   console.log("Session info:", session, sessionError);
  //   if (sessionError) {
  //     console.log(`An error ocurred retrieving session info:`, sessionError);
  //     return {
  //       isAuthorized: false,
  //     };
  //   }

  console.log("TODO REMOVE, returning here");
  return {
    isAuthorized: true,
    context: {
      session: {
        username: "joswayski",
        age: "blah",
      }, // TODO naming scheme? Maybe just event.user. whatever this is used in other functions
    },
  };
  //   const [user, userError] = await Users.getUserById({
  //     userId: session.userId,
  //   });

  //   if (userError) {
  //     console.log(`An error ocurred retrieving user info:`, userError);

  //     return {
  //       isAuthorized: false,
  //     };
  //   }

  //   if (!user) {
  //     console.log(`User no does not exist :(`);
  //     return {
  //       isAuthorized: false,
  //     };
  //   }

  //   return {
  //     isAuthorized: true,
  //     context: {
  //       session: user, // TODO naming scheme? Maybe just event.user. whatever this is used in other functions
  //     },
  //   };
};

//@ts-ignore // TODO types
module.exports.main = middy(main).use(lambdaAuthorizerMiddleware);
