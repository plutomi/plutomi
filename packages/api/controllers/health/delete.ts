import type { RequestHandler } from "express";

export const cleanup: RequestHandler = async (req, res) => {
  try {
    await req.items.deleteMany({});
    await req.items.deleteMany({});
    await req.items.deleteMany({});
    await req.items.deleteMany({});
    await req.items.deleteMany({});
    await req.items.deleteMany({});
    await req.items.deleteMany({});
    await req.items.deleteMany({});
    await req.items.deleteMany({});
    await req.items.deleteMany({});
    await req.items.deleteMany({});
    await req.items.deleteMany({});
    await req.items.deleteMany({});
    await req.items.deleteMany({});

    await req.items.deleteMany({});
    await req.items.deleteMany({});
    await req.items.deleteMany({});
    await req.items.deleteMany({});
    await req.items.deleteMany({});
    await req.items.deleteMany({});

    res.sendStatus(200);
  } catch (error) {
    res.status(500).json({ message: "Error connecting to MongoDB!", error });
  }
};
