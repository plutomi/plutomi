/* eslint-disable no-console */
import type { RequestHandler } from "express";

export const get: RequestHandler = async (req, res) => {
  try {
    res.status(200).json({ message: "Saul Goodman" });
    console.log(`Health check successful at ${new Date().toISOString()}`);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error on teh health check!!", error });
  }
};
