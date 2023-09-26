import type { RequestHandler } from "express";

export const get: RequestHandler = async (req, res) => {
  try {
    // const db = (await req.database.command({ ping: 1 })).ok as number;

    const response = {
      message: "Saul Goodman",
      // db,
    }
    res.status(200).json(response);

    
  } catch (error) {
    console.log(`Error parsing data`)
    console.error(error);
    res.status(500).json({ message: "Error connecting to MongoDB!", error });
  }
};
