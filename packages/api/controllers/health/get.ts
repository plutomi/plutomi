import type { RequestHandler } from "express";
import { getDbName } from "../../utils/db/getDbName";

export const get: RequestHandler = async (req, res) => {
  try {
    const result = await req.client.db(getDbName()).command({ ping: 1 });

    res.status(200).json({
      message: "Saul Goodman",
      db: result
    });
  } catch (error) {
    res.status(500).json({ message: "Error connecting to MongoDB!", error });
  }
};
