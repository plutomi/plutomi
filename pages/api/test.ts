import { getToken } from "next-auth/jwt";

const secret = process.env.JWT_SECRET;

const handler = async (req, res) => {
  const token = await getToken({ req, secret });
  console.log("JSON Web Token", token);
  return res.status(200).json(token);
};

export default handler;
