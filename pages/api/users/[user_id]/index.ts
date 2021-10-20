import withAuthorizer from "../../../../middleware/withAuthorizer";
import { GetUserById } from "../../../../utils/users/getUserById";
import { NextApiResponse } from "next";
import { UpdateUser } from "../../../../utils/users/updateUser";
const handler = async (req: CustomRequest, res: NextApiResponse) => {
  const { method, query, body } = req;
  const { user_id } = query;
  const { new_user_values } = body;
  const user: DynamoUser = req.user;

  if (method === "GET") {
    try {
      const requested_user = await GetUserById(user_id as string);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      // Check that the query.user_id is in the same org as the signed in user
      if (user.org_id != requested_user.org_id) {
        return res
          .status(401)
          .json({ message: "You are not authorized to view this user" });
      }

      return res.status(200).json(user);
    } catch (error) {
      // TODO add error logger
      return res
        .status(400) // TODO change #
        .json({ message: `${error}` });
    }
  }

  if (method === "PUT") {
    const update_user_input: UpdateUserInput = {
      new_user_values: new_user_values,
      user_id: user.user_id,
    };

    try {
      await UpdateUser(update_user_input);
      return res.status(200).json({ message: "Updated!" });
    } catch (error) {
      // TODO add error logger
      // TODO get correct status code
      return res
        .status(500)
        .json({ message: `Unable to update user ${error}` });
    }
  }

  return res.status(405).json({ message: "Not Allowed" });
};

export default withAuthorizer(handler);
