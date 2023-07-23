import type { RequestHandler } from "express";

export const get: RequestHandler = async (req, res) => {
  try {
    const items = await req.items
      .find({})
      .limit(Number(req.query.limit) ?? 100)
      .toArray();
    res.status(200).json({ items });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
};
