import type { RequestHandler } from "express";

export const get: RequestHandler = async (req, res) => {
  try {
  } catch (error) {
    // ! TODO: Logging

    await req.items.findOne({
      _id: req.user._id
    });
  }
};
