import { NextApiRequest, NextApiResponse } from "next";
import { JoinOrg } from "../../../../utils/users/joinOrg";
import InputValidation from "../../../../utils/inputValidation";
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method, query, body } = req;
  const { user_id } = body;
  const { org_id } = query;

  const join_org_input: JoinOrgInput = {
    user_id: user_id,
    org_id: org_id as string,
  };

  try {
    InputValidation(join_org_input);
  } catch (error) {
    return res.status(400).json({ message: `${error.message}` });
  }

  if (method === "POST") {
    try {
      await JoinOrg(join_org_input);
      return res
        .status(200)
        .json({ message: `You've joined the ${org_id} org!` });
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
