import type { RequestHandler } from "express";
import { getDbName } from "../../utils/db/getDbName";

const randomNumberBetween = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1) + min);

export const get: RequestHandler = async (req, res) => {
  const userId = `user_${randomNumberBetween(1, 11)}`;
  const user = {
    _id: userId,
    name: "Saul Goodman",
    relatedTo: [
      {
        id: userId,
        type: "id"
      }
    ]
  };

  const notes = Array.from({ length: randomNumberBetween(2, 20) }, () => ({
    _id: `${userId}#note_${randomNumberBetween(1, 11)}`,
    relatedTo: [
      {
        id: userId,
        type: "notes"
      }
    ]
  }));

  try {
    await req.items.insertMany([user, ...notes]);
    res.status(201).json({ message: "inserted" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error inserting data to MongoDB!", error });
    return;
  }
  //   res.status(200).json({
  //     message: "Saul Goodman",
  //     db: result
  //   });
  // } catch (error) {
  //   res.status(500).json({ message: "Error connecting to MongoDB!", error });
  // }
};
