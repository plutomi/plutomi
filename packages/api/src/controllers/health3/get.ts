import type { RequestHandler } from "express";
import axios from "axios";

export const get: RequestHandler = async (req, res) => {
  try {

    const metadata = await axios.get(process.env.ECS_CONTAINER_METADATA_URI_V4 as string);

    const response = {
      message: "Saul Goodman",
      metadata
    }
    res.status(200).json(response);

    
  } catch (error) {
    console.log(`Error parsing data`)
    console.error(error);
    res.status(500).json({ message: "Error getting meratada 3", error });
  }
};
