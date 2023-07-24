import type { RequestHandler } from "express";
import KSUID from "ksuid";

export const get: RequestHandler = async (req, res) => {
  const id = KSUID.randomSync().string;
  const timerId = `GET - ${id}`;
  console.time(timerId);
  try {
    const items = await req.items
      .find({})
      .limit(Number(req.query.limit) ?? 100)
      .toArray();
    console.timeEnd(timerId);

    res.status(200).json({ items });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
};
