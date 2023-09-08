import type { RequestHandler } from "express";

export const get: RequestHandler = async (req, res) => {
  try {
    const db = (await req.database.command({ ping: 1 })).ok as number;

    res.status(200).json({
      message: "Saul Goodman",
      db
    });
    // TODO we should log the DB error separately
  } catch (error) {
    res.status(500).json({ message: "Error connecting to MongoDB!", error });
  }
};
