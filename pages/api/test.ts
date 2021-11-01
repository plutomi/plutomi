const handler = async (req, res) => {
  const { method, query } = req;

  if (method === "GET") {
    return res.status(200).json({ message: "Live :)" });
  }

  return res.status(405).json({ message: "Not Allowed" });
};

export default handler;
