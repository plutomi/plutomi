import { NextApiRequest, NextApiResponse } from "next";
import { CreateUser } from "../../../utils/users/createUser";
import { SanitizeResponse } from "../../../utils/sanitizeResponse";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method, body } = req;
  const { first_name, last_name, user_email, password }: CreateUserInput = body;

  // Create a user
  if (method === "POST") {
    const create_user_input: CreateUserInput = {
      first_name: first_name,
      last_name: last_name,
      user_email: user_email,
      password: password,
    };

    for (const [key, value] of Object.entries(create_user_input)) {
      if (value == undefined) {
        return res
          .status(400)
          .json({ message: `Bad request: '${key}' is missing` });
      }
    }

    try {
      const user = await CreateUser(create_user_input);
      SanitizeResponse(user);
      return res.status(201).json(user);
    } catch (error) {
      // TODO add error logger
      return res
        .status(400) // TODO change #
        .json({ message: `${error}` });
    }
  }

  return res.status(405).json({ message: "Not Allowed" });
};

export default handler;
