import type { RequestHandler } from "express";
import axios from "axios";

export const get: RequestHandler = async (req, res) => {
    const id = req.query.id
  try {

    const metadata = await axios.get(`http://169.254.169.254/latest/meta-data/${id}`);

    const response = {
      message: "Saul Goodman",
      metadata
    }
    res.status(200).json(response);

    
  } catch (error) {
    console.log(`Error parsing data`)
    console.error(error);
    res.status(500).json({ message: "Error connecting to MongoDB!", error });
  }
};
