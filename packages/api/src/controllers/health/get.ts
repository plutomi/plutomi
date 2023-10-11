/* eslint-disable no-console */
import type { RequestHandler } from "express";
import axios from "axios";

export const get: RequestHandler = async (req, res) => {
  try {
    let identifier;

    // If it's an ECS container
    if (process.env.ECS_CONTAINER_METADATA_URI !== undefined) {
      const response = await axios.get(
        `${process.env.ECS_CONTAINER_METADATA_URI}/task`
      );
      identifier = response.data.TaskARN.split("/").pop(); // Get the Task ID from the ARN
    }

    res.status(200).json({ message: "Saul Goodman", identifier });
    console.log(`Health check successful at ${new Date().toISOString()}`);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error on the health check!!", error });
  }
};
