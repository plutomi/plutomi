import type { RequestHandler } from "express";

export const get: RequestHandler = async (req, res) => {
  try {
    // const db = (await req.database.command({ ping: 1 })).ok as number;

    // res.status(200).json({
    //   message: "Saul Goodman",
    //   db
    // });

    res.sendStatus(200);
  } catch (error) {
    res.status(500).json({ message: "Error connecting to MongoDB!", error });
  }
};
