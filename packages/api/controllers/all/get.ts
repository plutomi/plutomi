import type { RequestHandler } from "express";
import KSUID from "ksuid";

export const get: RequestHandler = async (req, res) => {
  const reqId = KSUID.randomSync().string;
  const startString = `start=${reqId}`;
  const dbString = `db=${reqId}`;
  console.time(startString);
  try {
    console.time(dbString);
    const results = await req.items.find({}).toArray();
    console.timeEnd(dbString);
    res.status(200).json(results);
    console.timeEnd(startString);
  } catch (error) {
    res.status(500).json({ message: "Error connecting to MongoDB!", error });
  }
};
