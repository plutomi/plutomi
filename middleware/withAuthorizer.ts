import { NextApiRequest, NextApiResponse } from "next";
import { getToken } from "next-auth/jwt";
import { GetUserById } from "../utils/users/getUserById";
type CustomRequest = NextApiRequest & { user: DynamoUser };

const secret = process.env.JWT_SECRET;
// interface CustomRequest extends NextApiRequest {
//   body: Body;
//   token: JWT;
//   user: DynamoUser;
// }

export default function withAuthorizer(handler: any) {
  return async (req: CustomRequest, res: NextApiResponse) => {
    try {
      const token: CustomJWT = await getToken({ req, secret });
      console.log("TOKEN", token)

      if (token) {
        try {
          const user = await GetUserById(token.user_id); // TODO fix types
          if (!user) {
            return res.status(400).json({ message: "Please login again" });
          }
          req.user = user;
          return handler(req, res);
        } catch (error) {
          return res
            .status(500)
            .json({ message: "An error ocurred getting your data" });
        }
      }

      return res.status(401).json({ message: "Please log in to continue" });
    } catch (error) {
      return res.status(500).json({ message: "Unable to verify token" });
    }
  };
}
